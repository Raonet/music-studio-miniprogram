function pad(n) { return String(n).padStart(2, '0') }

function calcCountdown(targetMs) {
  var diff = targetMs - Date.now()
  if (diff <= 0) return '00:00:00'
  var totalSecs = Math.floor(diff / 1000)
  var hours = Math.floor(totalSecs / 3600)
  var mins = Math.floor((totalSecs % 3600) / 60)
  var secs = totalSecs % 60
  return pad(hours) + ':' + pad(mins) + ':' + pad(secs)
}

Component({
  properties: {
    isOpen: { type: Boolean, value: false },
    // 下节课的时间戳（毫秒），由父页面传入
    lessonTime: { type: Number, value: 0 }
  },

  data: {
    countdownTime: '--:--:--'
  },

  observers: {
    'isOpen': function(isOpen) {
      if (isOpen) {
        this._startTimer()
      } else {
        this._stopTimer()
      }
    }
  },

  lifetimes: {
    detached: function() {
      this._stopTimer()
    }
  },

  methods: {
    _startTimer: function() {
      this._tick()
      this._timer = setInterval(this._tick.bind(this), 1000)
    },

    _stopTimer: function() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    },

    _tick: function() {
      var target = this.properties.lessonTime
      this.setData({ countdownTime: target ? calcCountdown(target) : '--:--:--' })
    },

    onClose: function() {
      this.triggerEvent('close')
    }
  }
})
