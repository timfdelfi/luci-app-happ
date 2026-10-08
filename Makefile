include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-happ
PKG_VERSION:=$(shell sed 's/-[^-]*$$//' $(CURDIR)/VERSION)
PKG_RELEASE:=$(shell sed 's/^.*-//' $(CURDIR)/VERSION)
PKG_MAINTAINER:=OpenWrt User
PKG_LICENSE:=MIT

LUCI_TITLE:=VPN в стиле Happ: вставил ссылку — нажал кнопку — работает
LUCI_DESCRIPTION:=Простой VPN-клиент для OpenWrt (sing-box, TUN). Подписки, VLESS/VMess/Trojan/SS/Hysteria2, автовыбор сервера.
LUCI_DEPENDS:=+luci-base +sing-box +kmod-tun +curl +jq +ca-bundle +ip-full
LUCI_PKGARCH:=all

PKG_FILE_MODES:=/usr/bin/happ:root:root:0755 \
	/usr/libexec/rpcd/happ:root:root:0755 \
	/etc/init.d/happ:root:root:0755 \
	/etc/uci-defaults/90-happ:root:root:0755

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
