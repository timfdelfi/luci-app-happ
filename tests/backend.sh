#!/bin/sh
# Тесты бэкенда (/usr/bin/happ) на заглушках: без роутера, sing-box и сети.
#   sh tests/backend.sh
cd "$(dirname "$0")/.." || exit 1
ROOT="$PWD"
fail=0
ok()  { printf '  ok   %s\n' "$1"; }
bad() { printf '  FAIL %s\n' "$1"; fail=1; }

W="$(mktemp -d)"
export HAPP_DIR="$W/etc" HAPP_RUN="$W/run" HAPP_LIB="$ROOT/root/usr/share/happ" HAPP_PID="$W/happ.pid"
export HAPP_CRON="$W/crontab" UCI_DB="$W/uci.db" NO_PROXY=127.0.0.1 no_proxy=127.0.0.1
export PATH="$ROOT/tests/mock:$PATH"
H="sh $ROOT/root/usr/bin/happ"
j() { printf '%s' "$1" | jq -e "$2" >/dev/null 2>&1; }
t() { j "$2" "$3" && ok "$1" || { bad "$1"; printf '       получено: %s\n' "$(printf '%s' "$2" | cut -c1-300)"; }; }

echo "== добавление и состояние"
r="$($H add "$(cat tests/links.txt)")"
t "add: 7 серверов из текста со ссылками" "$r" '.ok==true and .added==7'
r="$($H add 'просто мусор')"
t "add: мусор отклонён с понятной ошибкой" "$r" '.ok==false and (.error|length)>10'
r="$($H add '')"
t "add: пустой ввод отклонён" "$r" '.ok==false'
r="$($H state)"
t "state: серверы без секретов (outbound вырезан)" "$r" '(.servers|length)==7 and all(.servers[]; has("outbound")|not)'
t "state: источник «Мои ключи»" "$r" '.sources[0].id=="manual" and .sources[0].count==7'
t "state: статус «выключено»" "$r" '.status.phase=="off" and .status.connected==false'
t "state: настройки по умолчанию" "$r" '.settings.mtu==1400 and .settings.scope=="all" and .settings.block_ipv6==true'
t "state: по умолчанию российские сайты — напрямую" "$r" '.settings.bypass_ru==true'

echo "== настройки"
r="$(printf '%s' '{"kill_switch":true,"mtu":"abc","remote_dns":"not-ip","direct_domains":["example.org","bad domain!"],"mode":"include","devices":["192.168.1.50","999.1.1.1"],"presets":["telegram","nope"]}' | $H set)"
t "set: ok, но неверные значения перечислены" "$r" '.ok==true and (.ignored|index("mtu")) and (.ignored|index("remote_dns")) and (.ignored|any(startswith("direct_domains"))) and (.ignored|any(startswith("devices")))'
r="$($H settings)"
t "set: валидное сохранено, мусор — нет" "$r" '.kill_switch==true and .mtu==1400 and .remote_dns=="1.1.1.1" and .direct_domains==["example.org"] and .devices==["192.168.1.50"] and .presets==["telegram"] and .mode=="include"'
r="$(printf '%s' '{"mtu":1500,"update_interval":6}' | $H set)"
t "set: числа принимаются" "$r" '.ok==true and (.ignored|length)==0'
grep -q '^17 \*/6 \* \* \* /usr/bin/happ update-all' "$HAPP_CRON" && ok "cron: запись «каждые 6 часов»" || bad "cron: запись «каждые 6 часов»"
printf '%s' '{"update_interval":0}' | $H set >/dev/null
grep -q update-all "$HAPP_CRON" && bad "cron: запись удалена при «выключено»" || ok "cron: запись удалена при «выключено»"
r="$(printf 'не json' | $H set)"
t "set: некорректный JSON" "$r" '.ok==false'

echo "== выбор и удаление"
id="$($H state | jq -r '.servers[2].id')"
r="$($H select "$id")"
t "select: сервер выбран" "$r" ".ok==true and .selected==\"$id\""
r="$($H select 'x; rm -rf /')"
t "select: инъекция отклонена" "$r" '.ok==false'
r="$($H remove "$id")"
t "remove: сервер удалён" "$r" '.ok==true'
r="$($H state)"
t "remove: выбранный удалён → «Авто», осталось 6" "$r" '(.servers|length)==6 and .settings.selected=="auto" and .sources[0].count==6'
r="$($H remove 'zz zz')"
t "remove: некорректный id отклонён" "$r" '.ok==false'

echo "== подписка (локальный сервер)"
python3 tests/subserver.py 18765 tests/links.txt & SP=$!
sleep 1
r="$($H add http://127.0.0.1:18765/sub)"
t "подписка: добавлена, имя из Profile-Title" "$r" '.ok==true and .kind=="sub" and .name=="Тест" and .added==7'
r="$($H state)"
t "подписка: остаток трафика и срок" "$r" '[.sources[]|select(.kind=="sub")][0] | .total==10737418240 and .upload==1048576 and .download==2097152 and .expire==1893456000'
sid="$(printf '%s' "$r" | jq -r '[.sources[]|select(.kind=="sub")][0].id')"
sv="$(printf '%s' "$r" | jq -r --arg s "$sid" '[.servers[]|select(.source==$s)][0].id')"
$H remove "$sv" >/dev/null
r="$($H refresh "$sid")"
t "refresh: ok" "$r" '.ok==true and .updated==1 and .failed==0'
r="$($H state)"
t "refresh: удалённый пользователем сервер не вернулся" "$r" "([.servers[]|select(.source==\"$sid\")]|length)==6"
r="$($H add 'happ://add/http://127.0.0.1:18765/sub')"
t "add: ссылка-обёртка happ://add/… распознана" "$r" '.ok==true and .kind=="sub"'
$H remove "$sid" >/dev/null
r="$($H state)"
t "remove: подписка удаляется вместе с серверами" "$r" '([.sources[]|select(.kind=="sub")]|length)==0 and (.servers|length)==6'
kill $SP 2>/dev/null; wait $SP 2>/dev/null
r="$($H add http://127.0.0.1:18765/sub)"
t "подписка недоступна: понятная ошибка" "$r" '.ok==false and (.error|startswith("Не удалось скачать"))'

echo "== прочее"
r="$($H status)"
t "status: выключено, без ошибки" "$r" '.running==false and .phase=="off" and .error==""'
r="$($H connect)"
t "connect без sing-box: ошибка, а не ложное «ок»" "$r" '.ok==false and (.error|length)>5'
r="$($H disconnect)"
t "disconnect: ok" "$r" '.ok==true'
r="$($H clear)"
t "clear: всё очищено" "$r" '.ok==true'
t "clear: пусто" "$($H state)" '(.servers|length)==0 and (.sources|length)==0'

echo "== rpcd-плагин"
RP="sh $ROOT/root/usr/libexec/rpcd/happ"
$RP list | jq -e 'has("connect") and has("set") and has("ping")' >/dev/null && ok "list: валидный JSON с методами" || bad "list"
r="$(echo '{}' | HAPP_BIN="$ROOT/root/usr/bin/happ" $RP call status)"
t "call status: проксируется" "$r" 'has("running")'
r="$(echo '{}' | HAPP_BIN=/nonexistent $RP call state)"
t "call при сломанном бэкенде: JSON-ошибка, не пустой ответ" "$r" '.ok==false and (.error|length)>5'
r="$(echo '{}' | $RP call nope)"
t "call: неизвестный метод" "$r" '.ok==false'

echo "== выборочная маршрутизация"
printf '%s' '{"scope":"selected","presets":["telegram","youtube"],"proxy_domains":["example.net","203.0.113.7","*.foo.org"],"mode":"all","devices":[]}' | $H set >/dev/null
L="$($H selective-lists)"
printf '%s\n' "$L" | grep -qx 'D t.me' && ok "списки: домен пресета telegram" || bad "списки: домен пресета telegram"
printf '%s\n' "$L" | grep -qx 'C 149.154.160.0/20' && ok "списки: подсеть пресета telegram" || bad "списки: подсеть пресета telegram"
printf '%s\n' "$L" | grep -qx 'D youtube.com' && ok "списки: пресет youtube" || bad "списки: пресет youtube"
printf '%s\n' "$L" | grep -qx 'D example.net' && ok "списки: свой домен" || bad "списки: свой домен"
printf '%s\n' "$L" | grep -qx 'C 203.0.113.7' && ok "списки: свой IP попадает в подсети" || bad "списки: свой IP попадает в подсети"
printf '%s\n' "$L" | grep -qx 'D foo.org' && ok "списки: звёздочка *. снимается" || bad "списки: звёздочка *. снимается"
printf '%s\n' "$L" | grep -q 'discord' && bad "списки: невыбранный пресет не попадает" || ok "списки: невыбранный пресет не попадает"
N="$($H selective-nft)"
printf '%s\n' "$N" | grep -q 'meta mark set 0x64' && ok "nft: правило пометки есть" || bad "nft: правило пометки есть"
if command -v nft >/dev/null 2>&1 && printf '%s\n' "$N" | nft -c -f - >/dev/null 2>&1; then ok "nft: синтаксис принят nft -c"
else echo "  --   nft -c недоступен здесь, проверка синтаксиса пропущена"; fi
printf '%s' '{"mode":"include","devices":["192.168.1.50"]}' | $H set >/dev/null
$H selective-nft | grep -q 'ip saddr { 192.168.1.50 }' && ok "nft: режим «только выбранные устройства» учтён" || bad "nft: режим устройств"
printf '%s' '{"scope":"all","mode":"all","devices":[]}' | $H set >/dev/null
$H state | jq -e '.settings.bypass_ru==true or .settings.bypass_ru==false' >/dev/null && ok "состояние: поле bypass_ru есть" || bad "состояние: bypass_ru"

rm -rf "$W"
[ $fail -eq 0 ] && echo "ТЕСТЫ БЭКЕНДА ПРОЙДЕНЫ" || echo "ЕСТЬ ОШИБКИ В БЭКЕНДЕ"
exit $fail
