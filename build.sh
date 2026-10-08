#!/bin/sh
# Сборка установочных пакетов без OpenWrt SDK.
#   sh build.sh   ->   dist/happ-vpn.zip (Windows), dist/happ-vpn.tar.gz и dist/luci-app-happ_<версия>_all.ipk
set -e
cd "$(dirname "$0")"
VER="$(tr -d '\r\n' < VERSION)"
printf '%s\n' "$VER" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+-[0-9]+$' || {
	echo "Некорректная версия в VERSION: $VER" >&2
	exit 1
}
command -v ar >/dev/null 2>&1 || {
	echo "Для сборки .ipk нужна команда ar (пакет binutils)." >&2
	exit 1
}
OUT="$PWD/dist"; W="$(mktemp -d)"
trap 'rm -rf "$W"' EXIT
mkdir -p "$OUT"
rm -f "$OUT/happ-vpn.tar.gz" "$OUT/happ-vpn.zip" "$OUT/luci-app-happ_${VER}_all.ipk"

chmod 0755 root/usr/bin/happ root/usr/libexec/rpcd/happ root/etc/init.d/happ root/etc/uci-defaults/90-happ install.sh uninstall.sh

# 1) универсальный установщик (opkg и apk)
mkdir -p "$W/happ-vpn"
cp -a root htdocs install.sh uninstall.sh INSTALL.bat "$W/happ-vpn/"
find "$W/happ-vpn" -type f ! -name INSTALL.bat -exec sed -i 's/\r$//' {} +
tar --owner=0 --group=0 --numeric-owner -C "$W" -czf "$OUT/happ-vpn.tar.gz" happ-vpn
# zip для Windows: распаковать и запустить INSTALL.bat
if command -v zip >/dev/null 2>&1; then ( cd "$W" && zip -qr "$OUT/happ-vpn.zip" happ-vpn ); else echo "zip не найден — happ-vpn.zip не создан"; fi

# 2) .ipk для opkg (OpenWrt 24.10 и старше)
mkdir -p "$W/data/www" "$W/ctl"
cp -a root/. "$W/data/"
cp -a htdocs/. "$W/data/www/"
find "$W/data" "$W/ctl" -type f -exec sed -i 's/\r$//' {} +
cat > "$W/ctl/control" <<C
Package: luci-app-happ
Version: $VER
Depends: luci-base, rpcd, sing-box, kmod-tun, curl, jq, ca-bundle, ip-full
Section: luci
Architecture: all
Maintainer: OpenWrt User
Description: VPN в стиле Happ для OpenWrt: вставил ссылку, нажал кнопку, работает
C
echo /etc/config/happ > "$W/ctl/conffiles"
cat > "$W/ctl/postinst" <<'C'
#!/bin/sh
[ -n "$IPKG_INSTROOT" ] && exit 0
[ -x /etc/uci-defaults/90-happ ] && { sh /etc/uci-defaults/90-happ; rm -f /etc/uci-defaults/90-happ; }
/etc/init.d/rpcd restart >/dev/null 2>&1
/etc/init.d/firewall reload >/dev/null 2>&1
rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache 2>/dev/null
exit 0
C
cat > "$W/ctl/prerm" <<'C'
#!/bin/sh
[ -n "$IPKG_INSTROOT" ] && exit 0
/etc/init.d/happ stop >/dev/null 2>&1
/etc/init.d/happ disable >/dev/null 2>&1
exit 0
C
chmod 0755 "$W/ctl/postinst" "$W/ctl/prerm"
( cd "$W/ctl" && tar --owner=0 --group=0 --numeric-owner -czf "$W/control.tar.gz" . )
( cd "$W/data" && tar --owner=0 --group=0 --numeric-owner -czf "$W/data.tar.gz" . )
echo 2.0 > "$W/debian-binary"
( cd "$W" && ar -cr "$OUT/luci-app-happ_${VER}_all.ipk" debian-binary data.tar.gz control.tar.gz )
ls -l "$OUT"
