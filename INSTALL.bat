@echo off
chcp 65001 >nul
title Установка VPN на роутер OpenWrt
echo.
echo  Установка VPN (luci-app-happ) на роутер OpenWrt
echo  ------------------------------------------------
set "IP="
set /p IP=Адрес роутера [Enter = 192.168.1.1]: 
if "%IP%"=="" set "IP=192.168.1.1"
echo.
echo  Дальше роутер дважды спросит пароль root (при вводе символы не видны - это нормально).
echo.
tar -czf "%TEMP%\happ-vpn.tar.gz" -C "%~dp0." .
if errorlevel 1 goto fail
scp -O -o StrictHostKeyChecking=accept-new "%TEMP%\happ-vpn.tar.gz" root@%IP%:/tmp/happ-vpn.tar.gz
if errorlevel 1 goto fail
ssh root@%IP% "rm -rf /tmp/happ-vpn && mkdir -p /tmp/happ-vpn && tar xzf /tmp/happ-vpn.tar.gz -C /tmp/happ-vpn && find /tmp/happ-vpn -type f -exec sed -i 's/\r$//' {} + && sh /tmp/happ-vpn/install.sh"
if errorlevel 1 goto fail
del "%TEMP%\happ-vpn.tar.gz" >nul 2>&1
echo.
echo  Готово! Откройте веб-интерфейс роутера: Службы - VPN
pause
exit /b 0
:fail
echo.
echo  Что-то пошло не так. Проверьте адрес роутера и пароль и запустите файл ещё раз.
pause
exit /b 1
