#!/bin/sh
# Удаление VPN (luci-app-happ).  sh uninstall.sh [--purge]  (--purge удаляет и список серверов)
/etc/init.d/happ stop 2>/dev/null
/etc/init.d/happ disable 2>/dev/null
/usr/bin/happ net-down 2>/dev/null
grep -v '/usr/bin/happ update-all' /etc/crontabs/root > /tmp/cron.happ 2>/dev/null && mv /tmp/cron.happ /etc/crontabs/root
rm -f /usr/bin/happ /etc/init.d/happ /usr/libexec/rpcd/happ /etc/config/happ \
      /usr/share/rpcd/acl.d/luci-app-happ.json /usr/share/luci/menu.d/luci-app-happ.json \
      /usr/share/nftables.d/chain-pre/input/20-happ.nft /usr/share/nftables.d/chain-pre/forward/20-happ.nft
rm -rf /usr/share/happ /www/luci-static/resources/view/happ /var/run/happ
[ "$1" = "--purge" ] && rm -rf /etc/happ
/etc/init.d/rpcd restart >/dev/null 2>&1
/etc/init.d/firewall reload >/dev/null 2>&1
/etc/init.d/cron restart >/dev/null 2>&1
rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache 2>/dev/null
echo "VPN удалён."
