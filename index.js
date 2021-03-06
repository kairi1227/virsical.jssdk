;
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory()
        : typeof define === 'function' && define.amd
            ? define(factory)
            : global.Virsical = factory()
}(this, (function () {

    // document.write(" <script language=\"javascript\" src=\"qwebchannel.js\" >
    // </script>");

    'use strict';
    var Virsical;
    Virsical = new Object;
    var isDebugger = false;

    var _platform_other = 0;
    var _platform_android = 1;
    var _platform_ios = 2;
    var _platform_mac = 3;
    var _platform_Windows = 4;

    function setHadConfig() {
        sessionStorage.setItem("configStatus", true);
    }

    //做为是否config成功的标志，此处仅demo，实际需要考虑加密
    function hadConfig() {
        //        return sessionStorage.getItem("configStatus");
        return true;
    }

    //Windows终端接口
    function clickConfig(id, secret) {
        try {
            new QWebChannel(qt.webChannelTransport, function (channel) {
                var content = channel.objects.content;
                content.clickConfig(id, secret);
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    function getPlatform() {
        var u = navigator.userAgent;
        if (isDebugger) {
            window
                .console
                .log('Virsical: ', u);
        }
        if (u.indexOf('Android') > -1 || u.indexOf('Adr') > -1) { //android终端
            return _platform_android;
        } else if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            return _platform_ios;
        } else if (!!u.match(/Mac OS X/)) {
            return _platform_mac;
        } else if (u.indexOf('QtWebEngine') > -1) { //Windows终端
            return _platform_Windows;
        } else { // 其他设备
            return _platform_other;
        }
    }

    //绑定第三方应用分配的client_id和client_secret
    Virsical.config = function (info) {
        isDebugger = info.debug;
        var platform = getPlatform();
        if (platform == _platform_android) {
            try {
                if (window.control) {
                    window
                        .control
                        .config(info.debug, info.client_id, info.client_secret);
                } else {
                    window.location.href = 'vsk3browser://config?debug=' + info.debug + '&clientid=' + info.client_id + '&clientsecret=' + info.client_secret;
                }
            } catch (e) {
                throw new Error(e);
            }
        } else if (platform == _platform_ios || platform == _platform_mac) {
            //TODO ios
            window.location.href = 'vsk3browser://config?debug=' + info.debug + '&clientid=' + info.client_id + '&clientsecret=' + info.client_secret;
        } else if (platform == _platform_Windows) {
            //TODO Windows
            clickConfig(info.client_id, info.client_secret);
        } else {
            throw new Error("Device validation failed, only support for mobile devices");
        }
    }

    var configReadyCallback;
    Virsical.ready = function (callbackFunction) {
        configReadyCallback = callbackFunction;
    }

    //webview调用，config成功
    function configReady() {
        setHadConfig();
        configReadyCallback && configReadyCallback();
    }

    var configErrorCallback;
    Virsical.error = function (callbackFunction) {
        configErrorCallback = callbackFunction;
    };

    //webview调用，config失败
    function configError(mg, cd) {
        configReadyCallback && configReadyCallback({msg: mg, code: cd});
    }

    var loginTimer;
    var login_timeout_during = 60 * 1000;
    var login_timeout_code = 200;

    var loginSuccessCallback;
    var loginFailCallback;
    //设置登录超时回调方法
    Virsical.login = function (callbackFunction) {
        if (!hadConfig()) {
            window
                .console
                .error('no config, please using Virsical.config(...) to config your app.')
            alert("Please config app first");
            return;
        }

        loginSuccessCallback = callbackFunction.success;
        loginFailCallback = callbackFunction.fail;

        // loginTimer = setTimeout(loginTimeout(), login_timeout_during);
        var platform = getPlatform();

        if (platform == _platform_android) {
            try {
                if (window.control) {
                    window
                        .control
                        .login();
                } else {
                    window.location.href = 'vsk3browser://login';
                }
            } catch (e) {
                throw new Error(e);
            }
        } else if (platform == _platform_ios || platform == _platform_mac) {
            //TODO ios
            window.location.href = 'vsk3browser://login';
        }
    }

    //登录超时处理
    function loginTimeout() {
        loginResult("1", "", login_timeout_code, "Engineer no response");
    }

    //webview调用，返回登录结果信息
    function loginResult(result, json, cd, mg) {
        clearTimeout(loginTimer);
        if (result == 0) {
            loginSuccessCallback && loginSuccessCallback({info: json});
        } else {
            loginFailCallback && loginFailCallback({msg: mg, code: cd});
        }
    }

    var selectImageSuccessCallback;
    //选择图片
    Virsical.selectImage = function (info) {
        if (!hadConfig()) {
            alert("Please config app first");
            return;
        }
        selectImageSuccessCallback = info.successCallback;
        if (getPlatform() == _platform_android) {
            window
                .image
                .selectOne();
        } else if (getPlatform() == _platform_ios) {
            //TODO ios
        }
    };

    //webview调用，返回选择的图片信息
    function imageResult(ids) {
        selectImageSuccessCallback({localIds: ids});
    }

    //预览图片
    Virsical.previewImage = function (info) {
        if (!hadConfig()) {
            alert("Please config app first");
            return;
        }
        if (getPlatform() == _platform_android) {
            window
                .image
                .show(info.ids);
        } else if (getPlatform() == _platform_ios) {
            //TODO ios
        }
    }

    var locationTimer;
    var location_timeout_during = 60 * 1000;
    var location_timeout_code = 200;

    var locationSuccessCallback;
    var locationFailCallback;
    //设置定位超时回调方法
    Virsical.location = function (callbackFunction) {
        if (!hadConfig()) {
            alert("Please config app first");
            return;
        }
        locationTimer = setTimeout("locationTimeout()", location_timeout_during);
        locationSuccessCallback = callbackFunction.success;
        locationFailCallback = callbackFunction.fail;
        if (getPlatform() == _platform_android) {
            window
                .map
                .location();
        } else if (getPlatform() == _platform_ios) {
            //TODO ios
        }
    }

    //定位超时处理
    function locationTimeout() {
        locationResult("1", "", "", login_timeout_code, "Engineer no response");
    }

    //webview调用，返回登录结果信息
    function locationResult(result, addr, lat, lng, cd, mg) {
        clearTimeout(locationTimer);
        if (result == 0) {
            locationSuccessCallback({addr: addr, lat: lat, lng: lng});
        } else {
            locationFailCallback({msg: mg, code: cd});
        }
    }

    var workspaceSuccessCallback;
    var workspaceFailCallback;
    //扫描二维码
    Virsical.captureQR = function (callbackFunction) {
        if (!hadConfig()) {
            alert("Please config app first");
            return;
        }
        workspaceSuccessCallback = callbackFunction.success;
        workspaceFailCallback = callbackFunction.fail;
        var platform = getPlatform();
        if (platform == _platform_android) {
            if (window.captureqr) {
                window
                    .captureqr
                    .scan();
            } else {
                window.location.href = 'vsk3browser://captureqr';
            }
        } else if (platform == _platform_ios || platform == _platform_mac) {
            //TODO ios
            window.location.href = 'vsk3browser://captureqr';
        }
    }

    //webview调用，返回扫描结果信息
    function captureQRResult(result, url, cd, mg) {
        if (result == 0) {
            workspaceSuccessCallback({url: url});
        } else {
            workspaceFailCallback({msg: mg, code: cd});
        }
    }

    var messageCallback;
    Virsical.messageCallback = function (callback) {
        messageCallback = callback;
    }

    function sendMessage(message) {
        messageCallback && messageCallback(message);
    }

    window.configReady = configReady;
    window.configError = configError;
    window.loginResult = loginResult;
    window.imageResult = imageResult;
    window.locationResult = locationResult;
    window.captureQRResult = captureQRResult;
    window.sendMessage = sendMessage;

    return Virsical;
})));
