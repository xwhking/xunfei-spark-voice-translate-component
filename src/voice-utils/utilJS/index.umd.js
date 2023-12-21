!function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).RecorderManager = t()
}(this, (function () {
    "use strict";

    function e(e, t, r, o) {
        return new (r || (r = Promise))((function (n, a) {
            function i(e) {
                try {
                    u(o.next(e))
                } catch (e) {
                    a(e)
                }
            }

            function s(e) {
                try {
                    u(o.throw(e))
                } catch (e) {
                    a(e)
                }
            }

            function u(e) {
                var t;
                e.done ? n(e.value) : (t = e.value, t instanceof r ? t : new r((function (e) {
                    e(t)
                }))).then(i, s)
            }

            u((o = o.apply(e, t || [])).next())
        }))
    }

    function t(e, t) {
        var r, o, n, a, i = {
            label: 0, sent: function () {
                if (1 & n[0]) throw n[1];
                return n[1]
            }, trys: [], ops: []
        };
        return a = {
            next: s(0),
            throw: s(1),
            return: s(2)
        }, "function" == typeof Symbol && (a[Symbol.iterator] = function () {
            return this
        }), a;

        function s(s) {
            return function (u) {
                return function (s) {
                    if (r) throw new TypeError("Generator is already executing.");
                    for (; a && (a = 0, s[0] && (i = 0)), i;) try {
                        if (r = 1, o && (n = 2 & s[0] ? o.return : s[0] ? o.throw || ((n = o.return) && n.call(o), 0) : o.next) && !(n = n.call(o, s[1])).done) return n;
                        switch (o = 0, n && (s = [2 & s[0], n.value]), s[0]) {
                            case 0:
                            case 1:
                                n = s;
                                break;
                            case 4:
                                return i.label++, {value: s[1], done: !1};
                            case 5:
                                i.label++, o = s[1], s = [0];
                                continue;
                            case 7:
                                s = i.ops.pop(), i.trys.pop();
                                continue;
                            default:
                                if (!(n = i.trys, (n = n.length > 0 && n[n.length - 1]) || 6 !== s[0] && 2 !== s[0])) {
                                    i = 0;
                                    continue
                                }
                                if (3 === s[0] && (!n || s[1] > n[0] && s[1] < n[3])) {
                                    i.label = s[1];
                                    break
                                }
                                if (6 === s[0] && i.label < n[1]) {
                                    i.label = n[1], n = s;
                                    break
                                }
                                if (n && i.label < n[2]) {
                                    i.label = n[2], i.ops.push(s);
                                    break
                                }
                                n[2] && i.ops.pop(), i.trys.pop();
                                continue
                        }
                        s = t.call(e, i)
                    } catch (e) {
                        s = [6, e], o = 0
                    } finally {
                        r = n = 0
                    }
                    if (5 & s[0]) throw s[1];
                    return {value: s[0] ? s[1] : void 0, done: !0}
                }([s, u])
            }
        }
    }

    function r() {
        var e, t = navigator, r = t.getUserMedia || t.webkitGetUserMedia || t.mozGetUserMedia;
        return (null === (e = t.mediaDevices) || void 0 === e ? void 0 : e.getUserMedia) ? t.mediaDevices.getUserMedia({
            audio: !0,
            video: !1
        }) : r ? new Promise((function (e, t) {
            r.call(navigator, {audio: !0, video: !1}, (function (t) {
                e(t)
            }), (function (e) {
                t(e)
            }))
        })) : Promise.reject(new Error("不支持录音"))
    }

    var o;

    function n(r, n) {
        return e(this, void 0, void 0, (function () {
            var e;
            return t(this, (function (t) {
                switch (t.label) {
                    case 0:
                        return [3, 2];
                    case 1:
                        return t.sent(), [2, new AudioWorkletNode(r, "processor-worklet")];
                    case 2:
                        return (e = o) ? [3, 4] : [4, new Worker("".concat(n, "/processor.worker.js"))];
                    case 3:
                        e = t.sent(), t.label = 4;
                    case 4:
                        return [2, {port: o = e}]
                }
            }))
        }))
    }

    return function () {
        function o(e) {
            this.processorPath = e, this.audioBuffers = []
        }

        return o.prototype.start = function (o) {
            var a, i = o.sampleRate, s = o.frameSize, u = o.arrayBufferType;
            return e(this, void 0, void 0, (function () {
                var e, o, c, l, f, d, p;
                return t(this, (function (t) {
                    switch (t.label) {
                        case 0:
                            return t.trys.push([0, 3, , 4]), (e = this).audioBuffers = [], [4, r()];
                        case 1:
                            return o = t.sent(), this.audioTracks = o.getAudioTracks(), c = function (e, t) {
                                var r;
                                try {
                                    (r = new (window.AudioContext || window.webkitAudioContext)({sampleRate: t})).createMediaStreamSource(e)
                                } catch (t) {
                                    null == r || r.close(), (r = new (window.AudioContext || window.webkitAudioContext)).createMediaStreamSource(e)
                                }
                                return r
                            }(o, i), this.audioContext = c, l = c.createMediaStreamSource(o), [4, n(c, this.processorPath)];
                        case 2:
                            return f = t.sent(), this.audioWorklet = f, f.port.postMessage({
                                type: "init",
                                data: {
                                    frameSize: s,
                                    toSampleRate: i || c.sampleRate,
                                    fromSampleRate: c.sampleRate,
                                    arrayBufferType: u || "short16"
                                }
                            }), f.port.onmessage = function (t) {
                                var r = t.data, o = r.frameBuffer, n = r.isLastFrame;
                                if (s && e.onFrameRecorded) if (null == o ? void 0 : o.byteLength) for (var a = 0; a < o.byteLength;) e.onFrameRecorded({
                                    isLastFrame: n && a + s >= o.byteLength,
                                    frameBuffer: t.data.frameBuffer.slice(a, a + s)
                                }), a += s; else e.onFrameRecorded(t.data);
                                e.onStop && (o && e.audioBuffers.push(o), n && e.onStop(e.audioBuffers))
                            }, (d = c.createScriptProcessor(0, 1, 1)).onaudioprocess = function (e) {
                                f.port.postMessage({type: "message", data: e.inputBuffer.getChannelData(0)})
                            }, l.connect(d), d.connect(c.destination), c.resume(), null === (a = this.onStart) || void 0 === a || a.call(this), [3, 4];
                        case 3:
                            return p = t.sent(), console.error(p), [3, 4];
                        case 4:
                            return [2]
                    }
                }))
            }))
        }, o.prototype.stop = function () {
            var e, t, r, o;
            null === (e = this.audioWorklet) || void 0 === e || e.port.postMessage({type: "stop"}), null === (t = this.audioTracks) || void 0 === t || t[0].stop(), "running" === (null === (r = this.audioContext) || void 0 === r ? void 0 : r.state) && (null === (o = this.audioContext) || void 0 === o || o.close())
        }, o
    }()
}));
