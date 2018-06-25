(function ($, Yee) {
    var makePicker = function (elem, setting) {

        if (!setting) {
            setting = {};
        }
        setting['useTime'] = setting['useTime'] || false;
        if (setting.useTime) {
            setting['format'] = setting['format'] || 'yyyy-MM-dd HH:mm:ss';
        } else {
            setting['format'] = setting['format'] || 'yyyy-MM-dd';
        }
        //字符转日期格式
        var toDate = function (str, format) {
            var temp1 = format.split(/(yyyy|MMMM|dddd|MMM|ddd|yy|MM|dd|HH|mm|ss|TT|tt|hh|M|d|H|m|s|h|L|l|Z)/);
            var keys = {};
            var index = 0;
            for (var i = 0; i < temp1.length; i++) {
                var key = temp1[i];
                var val = '';
                switch (key) {
                    case 'yyyy' :
                        val = keys['yyyy'] = str.substr(index, 4);
                        break;
                    case 'ddd':
                    case 'MMM':
                        val = keys[key] = str.substr(index, 3);
                        break;
                    case 'dddd':
                        var char = str.substr(index, 2).toLowerCase();
                        switch (char) {
                            case 'su':
                                val = keys['dddd'] = 'Sunday';
                                break;
                            case 'mo':
                                val = keys['dddd'] = 'Monday';
                                break;
                            case 'tu':
                                val = keys['dddd'] = 'Tuesday';
                                break;
                            case 'we':
                                val = keys['dddd'] = 'Wednesday';
                                break;
                            case 'th':
                                val = keys['dddd'] = 'Thursday';
                                break;
                            case 'fr':
                                val = keys['dddd'] = 'Friday';
                                break;
                            case 'sa':
                                val = keys['dddd'] = 'Saturday';
                                break;
                            default:
                                throw new Error('格式错误');
                        }
                        break;
                    case 'MMMM':
                        var char = str.substr(index, 3).toLowerCase();
                        switch (char) {
                            //'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
                            case 'jan':
                                val = keys['MMMM'] = 'January';
                                break;
                            case 'feb':
                                val = keys['MMMM'] = 'February';
                                break;
                            case 'mar':
                                val = keys['MMMM'] = 'March';
                                break;
                            case 'apr':
                                val = keys['MMMM'] = 'April';
                                break;
                            case 'may':
                                val = keys['MMMM'] = 'May';
                                break;
                            case 'jun':
                                val = keys['MMMM'] = 'June';
                                break;
                            case 'jul':
                                val = keys['MMMM'] = 'July';
                                break;
                            case 'aug':
                                val = keys['MMMM'] = 'August';
                                break;
                            case 'sep':
                                val = keys['MMMM'] = 'September';
                                break;
                            case 'oct':
                                val = keys['MMMM'] = 'October';
                                break;
                            case 'nov':
                                val = keys['MMMM'] = 'November';
                                break;
                            case 'dec':
                                val = keys['MMMM'] = 'December';
                                break;
                            default:
                                throw new Error('格式错误');
                        }
                        break;
                    case 'tt' :
                    case 'TT' :
                        val = keys['tt'] = str.substr(index, 2).toLowerCase();
                        break;
                    case 'yy' :
                    case 'MM' :
                    case 'dd' :
                    case 'HH' :
                    case 'hh' :
                    case 'mm' :
                    case 'ss' :
                        val = keys[key] = str.substr(index, 2);
                        break;
                    case 'M' :
                    case 'd' :
                    case 'H' :
                    case 'h' :
                    case 'm' :
                    case 's' :
                        var d = str.substr(index + 1, 1);
                        if (/^\d$/.test(d)) {
                            val = keys[key] = str.substr(index, 2);
                        }
                        else {
                            val = keys[key] = str.substr(index, 1);
                        }
                        break;
                    case 'l' :
                        val = keys[key] = str.substr(index, 3);
                        break;
                    case 'L' :
                        val = keys[key] = str.substr(index, 2);
                        break;
                    default:
                        val = key;
                        break;
                }
                index += val.length;
            }
            //console.log(keys);
            var args = {};
            if (keys['yyyy'] && /^\d+$/.test(keys['yyyy'])) {
                args['yyyy'] = parseInt(keys['yyyy']);
            }
            if (!args['yyyy'] && keys['yy'] && /^\d+$/.test(keys['yy'])) {
                args['yyyy'] = parseInt(String(new Date().getMonth()).substr(0, 2) + parseInt(keys['yy']));
            }
            if (!args['yyyy']) {
                args['yyyy'] = 0;
            }
            if (keys['MM'] && /^\d+$/.test(keys['MM'])) {
                args['MM'] = parseInt(keys['MM']);
            }
            if (!args['MM'] && keys['M'] && /^\d+$/.test(keys['M'])) {
                args['MM'] = parseInt(keys['M']);
            }
            if (!args['MM'] && keys['MMM']) {
                var temps = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                var tkey = keys['MMM'].toLowerCase();
                for (var i = 0; i < temps.length; i++) {
                    if (temps[i] == tkey) {
                        args['MM'] = i + 1;
                        break;
                    }
                }
            }
            if (!args['MM'] && keys['MMMM']) {
                var temps = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                var tkey = keys['MMMM'].toLowerCase();
                for (var i = 0; i < temps.length; i++) {
                    if (temps[i] == tkey) {
                        args['MM'] = i + 1;
                        break;
                    }
                }
            }
            if (!args['MM']) {
                args['MM'] = 0;
            }
            if (keys['dd'] && /^\d+$/.test(keys['dd'])) {
                args['dd'] = parseInt(keys['dd']);
            }
            if (!args['dd'] && keys['d'] && /^\d+$/.test(keys['d'])) {
                args['dd'] = parseInt(keys['d']);
            }
            if (!args['dd']) {
                args['dd'] = 0;
            }
            //小时
            if (keys['HH'] && /^\d+$/.test(keys['HH'])) {
                args['HH'] = parseInt(keys['HH']);
            }
            if (!args['HH'] && keys['H'] && /^\d+$/.test(keys['H'])) {
                args['HH'] = parseInt(keys['H']);
            }
            if (keys['tt']) {
                args['tt'] = keys['tt'].toLowerCase();
            }
            if (!args['HH'] && keys['hh'] && /^\d+$/.test(keys['hh'])) {
                args['HH'] = parseInt(keys['hh']);

                if (args['tt'] && args['tt'] == 'pm') {
                    args['HH'] = args['HH'] + 12;
                }
            }
            if (!args['HH'] && keys['h'] && /^\d+$/.test(keys['h'])) {
                args['HH'] = parseInt(keys['h']);

                if (args['tt'] && args['tt'] == 'pm') {
                    args['HH'] = args['HH'] + 12;
                }

            }
            if (!args['HH']) {
                args['HH'] = 0;
            }
            if (keys['mm'] && /^\d+$/.test(keys['mm'])) {
                args['mm'] = parseInt(keys['mm']);
            }
            if (!args['mm'] && keys['m'] && /^\d+$/.test(keys['m'])) {
                args['mm'] = parseInt(keys['m']);
            }
            if (!args['mm']) {
                args['mm'] = 0;
            }
            if (keys['ss'] && /^\d+$/.test(keys['ss'])) {
                args['ss'] = parseInt(keys['ss']);
            }
            if (!args['ss'] && keys['s'] && /^\d+$/.test(keys['s'])) {
                args['ss'] = parseInt(keys['s']);
            }
            if (!args['ss']) {
                args['ss'] = 0;
            }
            //console.log(args);
            return new Date(args['yyyy'], args['MM'] - 1, args['dd'], args['HH'], args['mm'], args['ss']);
        }
        //日期格式转字符
        var dateFormat = function (date, format = 'yyyy-MM-dd') {
            var zeroize = function (value, length = 2) {
                var zeros = '';
                value = String(value);
                for (var i = 0; i < (length - value.length); i++) {
                    zeros += '0';
                }
                return zeros + value;
            }

            var mask = format.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|(?:yyyy|yy)|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
                switch ($0) {
                    case 'd':
                        return date.getDate();
                    case 'dd':
                        return zeroize(date.getDate());
                    case 'ddd':
                        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()];
                    case 'dddd':
                        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                    case 'M':
                        return date.getMonth() + 1;
                    case 'MM':
                        return zeroize(date.getMonth() + 1);
                    case 'MMM':
                        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
                    case 'MMMM':
                        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
                    case 'yy':
                        return String(date.getFullYear()).substr(2);
                    case 'yyyy':
                        return date.getFullYear();
                    case 'h':
                        return date.getHours() % 12 || 12;
                    case 'hh':
                        return zeroize(date.getHours() % 12 || 12);
                    case 'H':
                        return date.getHours();
                    case 'HH':
                        return zeroize(date.getHours());
                    case 'm':
                        return date.getMinutes();
                    case 'mm':
                        return zeroize(date.getMinutes());
                    case 's':
                        return date.getSeconds();
                    case 'ss':
                        return zeroize(date.getSeconds());
                    case 'l':
                        return zeroize(date.getMilliseconds(), 3);
                    case 'L':
                        var m = date.getMilliseconds();
                        if (m > 99) m = Math.round(m / 10);
                        return zeroize(m);
                    case 'tt':
                        return date.getHours() < 12 ? 'am' : 'pm';
                    case 'TT':
                        return date.getHours() < 12 ? 'AM' : 'PM';
                    default:
                        return $0.substr(1, $0.length - 2);
                }
            });
            return mask;
        };
        var monthMap = {1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一', 12: '十二'};
        var weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        var qem = $(elem);
        var input = qem;
        if (!qem.is(':input')) {
            if (setting['input']) {
                input = $(setting['input']);
            }
        }
        var dateValue = new Date();
        var dateInstance = null;

        function DatePicker() {
            var showType = '';
            var instance = this;

            //辅助函数
            function getDayMap(dataYear, dataMonth) {
                var lastday = new Date(dataYear, dataMonth, 0).getDate();
                var dayMap = [];
                var weekMap = [0, 0, 0, 0, 0, 0, 0];
                for (var day = 1; day <= lastday; day++) {
                    var week = new Date(dataYear, dataMonth - 1, day).getDay();
                    weekMap[week] = day;
                    if (week == 6 || day == lastday) {
                        dayMap.push(weekMap);
                        weekMap = [0, 0, 0, 0, 0, 0, 0];
                    }
                }
                return dayMap;
            }

            var createYMBox = function (picker, mainLayout) {
                var baseBox = $('<div class="yee-picker-sel-year-month"></div>').appendTo(mainLayout);
                var tempA = $('<a class="yee-picker-year-layout" href="javascript:;"></a>').appendTo(baseBox);
                var selYearBox = $('<div class="yee-picker-sel-year"></div>').appendTo(tempA);
                var selMonthBox = $('<div class="yee-picker-sel-month"></div>').appendTo(baseBox);
                if (Yee) {
                    Yee.use('jquery-mousewheel').then(function () {
                        selYearBox.on('mousewheel', function (ev) {
                            ev.stopPropagation();
                        });
                    });
                } else if ($.fn.mousewheel) {
                    selYearBox.on('mousewheel', function (ev) {
                        ev.stopPropagation();
                    });
                }
                tempA.on('mouseenter', function () {
                    $(this).focus();
                });
                tempA.on('mouseleave', function () {
                    $(this).blur();
                });
                var ul = $('<ul></ul>').appendTo(selYearBox);
                var curYear = new Date().getFullYear();
                var startYear = curYear - 100;
                var endYear = curYear + 100;
                for (var i = startYear; i < endYear; i++) {
                    var li = $('<li index="' + i + '"></li>').text(i).appendTo(ul);
                    li.on('click', i, function (ev) {
                        picker.emit('setYear', ev.data);
                    });
                }
                var n = 0;
                for (var i = 0; i < 6; i++) {
                    var div = $('<div></div>').appendTo(selMonthBox);
                    for (var j = 0; j < 2; j++) {
                        var m = ++n;
                        var btn = $('<button></button>').text(monthMap[m]).appendTo(div);
                        btn.on('click', m, function (ev) {
                            picker.emit('setMonth', ev.data);
                            picker.emit('showDate');
                        });
                    }
                }
                //事件==========
                picker.on('setYear', function (ev, year) {
                    ul.find('li').removeClass('yee-picker-current');
                    var currentLi = ul.find('li[index="' + year + '"]');
                    if (currentLi.length > 0) {
                        currentLi.addClass('yee-picker-current');
                        $(function () {
                            var utop = ul.position().top;
                            var top = currentLi.position().top - 65;
                            top = top - utop;
                            selYearBox.animate({scrollTop: top}, 300);
                        });
                    }
                });
                picker.on('setMonth', function (ev, month) {
                    var btns = selMonthBox.find('button').removeClass('yee-picker-current');
                    btns.eq(month - 1).addClass('yee-picker-current');

                });
                picker.on('showYM', function () {
                    if (showType == 'YM') {
                        return;
                    }
                    showType = 'YM';
                    $(function () {
                        var height = baseBox.outerHeight(true);
                        mainLayout.height(height);
                        mainLayout.animate({scrollTop: 0}, 300, 'swing');
                    });
                });
                return baseBox;
            }
            var createDateBox = function (picker, mainLayout) {
                var dataYear = 0;
                var dataMonth = 0;
                var dateDay = 0;
                var baseBox = $('<div class="yee-picker-sel-day"></div>').appendTo(mainLayout);
                $('<div class="yee-picker-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>').appendTo(baseBox);

                picker.on('setDate', function (ev, date) {
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    var day = date.getDate();
                    if (year == dataYear && month == dataMonth && day == dateDay) {
                        return;
                    }
                    if (dataYear == year && dataMonth == month) {
                        picker.emit('setDay', day);
                    } else {
                        dateDay = day;
                    }
                    if (year != dataYear) {
                        dataMonth = 0;
                        picker.emit('setYear', year);
                    }
                    if (month != dataMonth) {
                        picker.emit('setMonth', month);
                    }
                });

                picker.on('setYear', function (ev, year) {
                    if (year == dataYear) {
                        return;
                    }
                    dataYear = year;
                    if (dataMonth == 0) {
                        return;
                    }
                    var lastDay = new Date(dataYear, dataMonth, 0).getDate();
                    if (dateDay > lastDay) {
                        picker.emit('resetDay', lastDay);
                        return;
                    }
                    picker.emit('resetDay', dateDay);
                });

                picker.on('setMonth', function (ev, month) {
                    if (month == dataMonth) {
                        return;
                    }
                    dataMonth = month;
                    var lastDay = new Date(dataYear, dataMonth, 0).getDate();
                    if (dateDay > lastDay) {
                        picker.emit('resetDay', lastDay);
                        return;
                    }
                    picker.emit('resetDay', dateDay);
                });

                picker.on('resetDay', function (ev, day) {
                    if (dataYear == 0 || dataMonth == 0) {
                        return;
                    }
                    baseBox.find('div.yee-picker-day-row').remove();
                    var dayMap = getDayMap(dataYear, dataMonth);
                    for (var i = 0; i < dayMap.length; i++) {
                        var weekMap = dayMap[i];
                        var row = $('<div class="yee-picker-day-row"></div>').appendTo(baseBox);
                        for (var j = 0; j < weekMap.length; j++) {
                            var d = weekMap[j];
                            if (d == 0) {
                                $('<span>').appendTo(row);
                            } else {
                                var btn = $('<button index="' + d + '"></button>').appendTo(row);
                                $('<span></span>').text(d).appendTo(btn);
                                btn.on('click', d, function (ev) {
                                    picker.emit('setDay', ev.data);
                                    if (setting.useTime) {
                                        picker.emit('showTime');
                                    } else {
                                        setTimeout(function () {
                                            var date = new Date(dataYear, dataMonth - 1, dateDay);
                                            picker.emit('choiceDate', date);
                                        }, 10);
                                    }
                                });
                            }
                        }
                    }
                    if (dayMap.length < 6) {
                        var row = $('<div class="yee-picker-day-row"></div>').appendTo(baseBox);
                        $('<span></span>').appendTo(row);
                        var btn = $('<button class="yee-picker-today"><span>今天</span></button>').appendTo(row);
                        btn.on('click', function (ev) {
                            picker.emit('setDate', new Date());
                            if (!setting.useTime) {
                                picker.emit('choiceDate', new Date());
                            }
                        });
                    } else {
                        var row = baseBox.find('div.yee-picker-day-row:last');
                        var btn = $('<button class="yee-picker-today"><span>今天</span></button>').appendTo(row);
                        btn.on('click', function (ev) {
                            picker.emit('setDate', new Date());
                            if (!setting.useTime) {
                                picker.emit('choiceDate', new Date());
                            }
                        });
                    }
                    picker.emit('setDay', day);
                    if (showType == 'Date') {
                        picker.emit('showDate', true);
                    }
                    if (showType == 'Time') {
                        picker.emit('showTime', true);
                    }
                });

                picker.on('setDay', function (ev, day) {
                    dateDay = day;
                    var btns = baseBox.find('div.yee-picker-day-row button').removeClass('yee-picker-current');
                    btns.filter('[index="' + day + '"]').addClass('yee-picker-current');
                    var date = new Date(dataYear, dataMonth - 1, dateDay);
                    picker.emit('changeDate', date);
                });

                picker.on('addMonth', function (ev) {
                    if (dataMonth == 0 || dataYear == 0) {
                        return;
                    }
                    var month = dataMonth + 1;
                    var year = dataYear;
                    if (month > 12) {
                        month -= 12;
                        year += 1;
                    }
                    if (year != dataYear) {
                        picker.emit('setYear', year);
                    }
                    picker.emit('setMonth', month);
                });

                picker.on('decMonth', function (ev) {
                    if (dataMonth == 0 || dataYear == 0) {
                        return;
                    }
                    var month = dataMonth - 1;
                    var year = dataYear;
                    if (month < 1) {
                        month = 12;
                        year -= 1;
                    }
                    if (year != dataYear) {
                        picker.emit('setYear', year);
                    }
                    picker.emit('setMonth', month);
                });

                picker.on('addDay', function (ev) {
                    if (dateDay == 0 || dataMonth == 0 || dataYear == 0) {
                        return;
                    }
                    var lastDay = new Date(dataYear, dataMonth - 1, 0).getDate();//当前最后一天
                    var day = dateDay + 1;
                    if (day > lastDay) {
                        picker.emit('addMonth');
                        picker.emit('setDay', 1);
                        return;
                    }
                    picker.emit('setDay', day);
                });

                picker.on('decDay', function (ev) {
                    if (dateDay == 0 || dataMonth == 0 || dataYear == 0) {
                        return;
                    }
                    var day = dateDay - 1;
                    if (day < 1) {
                        picker.emit('decMonth');
                        var lastDay = new Date(dataYear, dataMonth - 1, 0).getDate();
                        picker.emit('setDay', lastDay);
                        return;
                    }
                    picker.emit('setDay', day);
                });

                var fisrtShow = true;
                picker.on('showDate', function (ev, force) {
                    if (!force && showType == 'Date') {
                        return;
                    }
                    showType = 'Date';
                    var height = baseBox.outerHeight(true);
                    if (setting.useTime) {
                        height += 30;
                    } else {
                        height += 5;
                    }
                    mainLayout.height(height);
                    var top = baseBox.position().top + mainLayout.scrollTop();
                    if (force || fisrtShow) {
                        fisrtShow = false;
                        mainLayout.scrollTop(top);
                    } else {
                        mainLayout.animate({scrollTop: top}, 300, 'swing');
                    }
                });
                return baseBox;
            }
            var createTimeBox = function (picker, mainLayout) {

                var dataHour = -1;
                var dataMinute = -1;
                var dataSecond = -1;
                var dataDate = null;

                var baseBox = $('<div class="yee-picker-sel-hms"></div>').appendTo(mainLayout);
                var displayBox = $('<div class="yee-picker-time-display"></div>').appendTo(baseBox);
                var btn1 = $('<button class="yee-picker-time"><span>时间 <b>08:20:26</b></span></button>').appendTo(displayBox);
                var btn2 = $('<button class="yee-picker-time-choice"><span>确定</span></button>').appendTo(displayBox);
                var layout = $('<div class="yee-picker-sel-hms-layout"></div>').appendTo(baseBox);
                var hourBox = $('<div class="yee-picker-sel-hour"></div>').appendTo(layout);
                $('<div class="yee-picker-sel-apart"></div>').appendTo(layout);
                var minuteBox = $('<div class="yee-picker-sel-minute"></div>').appendTo(layout);
                $('<div class="yee-picker-sel-apart"></div>').appendTo(layout);
                var secondBox = $('<div class="yee-picker-sel-second"></div>').appendTo(layout);
                var item1 = $('<div></div>').appendTo(hourBox);

                var decBtn1 = $('<button>-</button>').appendTo(item1);
                var addBtn1 = $('<button>+</button>').appendTo(item1);

                picker.on('setDateTime', function (ev, date) {
                    var hour = date.getHours();
                    var minute = date.getMinutes();
                    var second = date.getSeconds();
                    dataDate = date;
                    picker.emit('setDate', date);
                    if (hour == dataHour && minute == dataMinute && second == dataSecond) {
                        return;
                    }
                    if (hour != dataHour) {
                        picker.emit('setHour', hour);
                    }
                    if (minute != dataMinute) {
                        picker.emit('setMinute', minute);
                    }
                    if (second != dataSecond) {
                        picker.emit('setSecond', second);
                    }
                });

                function changeDateTime() {
                    if (dataHour < 0 || dataMinute < 0 || dataSecond < 0) {
                        return;
                    }
                    var th = String(dataHour).length < 2 ? '0' + dataHour : dataHour;
                    var tm = String(dataMinute).length < 2 ? '0' + dataMinute : dataMinute;
                    var ts = String(dataSecond).length < 2 ? '0' + dataSecond : dataSecond;
                    btn1.find('span b').text(th + ':' + tm + ':' + ts);
                    var datatime = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate(), dataHour, dataMinute, dataSecond);
                    picker.emit('changeDateTime', datatime);
                }

                btn2.on('click', function () {
                    if (dataHour < 0 || dataMinute < 0 || dataSecond < 0) {
                        return;
                    }
                    var th = String(dataHour).length < 2 ? '0' + dataHour : dataHour;
                    var tm = String(dataMinute).length < 2 ? '0' + dataMinute : dataMinute;
                    var ts = String(dataSecond).length < 2 ? '0' + dataSecond : dataSecond;
                    btn1.find('span b').text(th + ':' + tm + ':' + ts);
                    var datatime = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate(), dataHour, dataMinute, dataSecond);
                    picker.emit('choiceDateTime', datatime);
                });
                picker.on('changeDate', function (ev, date) {
                    dataDate = date;
                    changeDateTime();
                });
                var h = 0;
                for (var i = 0; i < 6; i++) {
                    var item = $('<div></div>').appendTo(hourBox);
                    for (var j = 0; j < 4; j++) {
                        var text = String(h).length < 2 ? '0' + h : h;
                        var button = $('<button></button>').attr('index', h).text(text).appendTo(item);
                        button.on('click', h, function (ev) {
                            picker.emit('setHour', ev.data);
                        });
                        h++;
                    }
                }
                var item2 = $('<div></div>').appendTo(minuteBox);
                var decBtn2 = $('<button>-</button>').appendTo(item2);
                var addBtn2 = $('<button>+</button>').appendTo(item2);

                var m = 0;
                for (var i = 0; i < 6; i++) {
                    var item = $('<div></div>').appendTo(minuteBox);
                    for (var j = 0; j < 2; j++) {
                        var text = String(m).length < 2 ? '0' + m : m;
                        var button = $('<button></button>').attr('index', m).text(text).appendTo(item);
                        button.on('click', m, function (ev) {
                            picker.emit('setMinute', ev.data);
                        });
                        m += 5;
                    }
                }
                var item3 = $('<div></div>').appendTo(secondBox);
                var decBtn3 = $('<button>-</button>').appendTo(item3);
                var addBtn3 = $('<button>+</button>').appendTo(item3);
                var s = 0;
                for (var i = 0; i < 6; i++) {
                    var item = $('<div></div>').appendTo(secondBox);
                    for (var j = 0; j < 2; j++) {
                        var text = String(s).length < 2 ? '0' + s : s;
                        var button = $('<button></button>').attr('index', s).text(text).appendTo(item);
                        button.on('click', s, function (ev) {
                            picker.emit('setSecond', ev.data);
                        });
                        s += 5;
                    }
                }
                picker.on('showTime', function (ev, force) {
                    if (!force && showType == 'Time') {
                        return;
                    }
                    showType = 'Time';
                    var height = baseBox.outerHeight(true);
                    height += 10;
                    mainLayout.height(height);
                    var top = baseBox.position().top + mainLayout.scrollTop() - 5;
                    if (force) {
                        mainLayout.scrollTop(top);
                    } else {
                        mainLayout.animate({scrollTop: top}, 300, 'swing');
                    }
                });
                picker.on('setHour', function (ev, hour) {
                    dataHour = hour;
                    var btns = hourBox.find('button').removeClass('yee-picker-current');
                    btns.filter('[index="' + hour + '"]').addClass('yee-picker-current');
                    changeDateTime();
                });
                picker.on('setMinute', function (ev, minute) {
                    var change = dataMinute != minute;
                    dataMinute = minute;
                    var leq = minuteBox.find('button.yee-picker-current').removeClass('yee-picker-current');
                    var lt = leq.attr('index');
                    var ltext = String(lt).length < 2 ? '0' + lt : lt;
                    leq.text(ltext);
                    var t = Math.floor(minute / 5) * 5;
                    var em = minuteBox.find('button[index="' + t + '"]').addClass('yee-picker-current');
                    var text = String(minute).length < 2 ? '0' + minute : minute;
                    em.text(text);
                    if (change) {
                        picker.emit('setSecond', 0);
                    } else {
                        changeDateTime();
                    }
                });
                picker.on('setSecond', function (ev, second) {
                    if (dataSecond == second) {
                        return;
                    }
                    dataSecond = second;
                    var leq = secondBox.find('button.yee-picker-current').removeClass('yee-picker-current');
                    var lt = leq.attr('index');
                    var ltext = String(lt).length < 2 ? '0' + lt : lt;
                    leq.text(ltext);
                    var t = Math.floor(second / 5) * 5;
                    var em = secondBox.find('button[index="' + t + '"]').addClass('yee-picker-current');
                    var text = String(second).length < 2 ? '0' + second : second;
                    em.text(text);
                    changeDateTime();
                });
                picker.on('addHour', function (ev) {
                    if (dataHour < 0) {
                        return;
                    }
                    var hour = dataHour + 1;
                    if (hour > 23) {
                        hour = 0;
                        picker.emit('addDay');
                    }
                    picker.emit('setHour', hour);
                });
                addBtn1.on('click', function () {
                    picker.emit('addHour');
                });
                picker.on('decHour', function (ev) {
                    if (dataHour < 0) {
                        return;
                    }
                    var hour = dataHour - 1;
                    if (hour < 0) {
                        hour = 23;
                        picker.emit('decDay');
                    }
                    picker.emit('setHour', hour);
                });
                decBtn1.on('click', function () {
                    picker.emit('decHour');
                });
                picker.on('addMinute', function (ev) {
                    if (dataMinute < 0) {
                        return;
                    }
                    var minute = dataMinute + 1;
                    if (minute > 59) {
                        minute = 0;
                        picker.emit('addHour');
                    }
                    picker.emit('setMinute', minute);
                });
                addBtn2.on('click', function () {
                    picker.emit('addMinute');
                });
                picker.on('decMinute', function (ev) {
                    if (dataMinute < 0) {
                        return;
                    }
                    var minute = dataMinute - 1;
                    if (minute < 0) {
                        minute = 59;
                        picker.emit('decHour');
                    }
                    picker.emit('setMinute', minute);
                });
                decBtn2.on('click', function () {
                    picker.emit('decMinute');
                });

                picker.on('addSecond', function (ev) {
                    if (dataSecond < 0) {
                        return;
                    }
                    var second = dataSecond + 1;
                    if (second > 59) {
                        second = 0;
                        picker.emit('addMinute');
                    }
                    picker.emit('setSecond', second);
                });

                addBtn3.on('click', function () {
                    picker.emit('addSecond');
                });

                picker.on('decSecond', function (ev) {
                    if (dataSecond < 0) {
                        return;
                    }
                    var second = dataSecond - 1;
                    if (second < 0) {
                        second = 59;
                        picker.emit('decMinute');
                    }
                    picker.emit('setSecond', second);
                });

                decBtn3.on('click', function () {
                    picker.emit('decSecond');
                });

                btn1.on('click', function () {
                    if (showType == 'Date') {
                        picker.emit('showTime');
                    } else {
                        picker.emit('showDate');
                    }
                });

            }
            var picker = $('<div class="yee-picker"></div>').hide().appendTo(document.body);
            var displayLabel = $('<div class="yee-picker-display"></div>').appendTo(picker);
            var toolbarLayout = $('<div class="yee-picker-toolbar"></div>').appendTo(picker);
            var mainLayout = $('<div class="yee-picker-main"></div>').appendTo(picker);
            var toolLeftBtn = $('<button><svg viewBox="0 0 24 24" class="yee-picker-svg-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button>').appendTo(toolbarLayout);
            var toolDisplay = $('<div class="yee-picker-year"></div>').appendTo(toolbarLayout);
            var toolLabel = $('<a class="yee-picker-year-btn" href="javascript:;"></a>').appendTo(toolDisplay);
            var toolMonthLabel = $('<span></span>').appendTo(toolLabel);
            var toolDayLabel = $('<span></span>').hide().appendTo(toolLabel);
            var toolRightBtn = $('<button><svg viewBox="0 0 24 24" class="yee-picker-svg-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></button>').appendTo(toolbarLayout);
            createYMBox(picker, mainLayout);
            createDateBox(picker, mainLayout);
            if (setting.useTime) {
                createTimeBox(picker, mainLayout);
                picker.on('changeDateTime', function (ev, date) {
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    var day = date.getDate();
                    var week = date.getDay();
                    if (month == 11 || month == 12) {
                        toolMonthLabel.text(year + '年 ' + monthMap[month] + '月');
                    } else {
                        toolMonthLabel.text(year + '年 ' + monthMap[month]);
                    }
                    toolDayLabel.text(day + '日');
                    displayLabel.text(year + ' ' + dateFormat(date, 'MM-dd HH:mm:ss') + ' ' + weekMap[week]);
                    var change = dateFormat(date, setting.format);
                    qem.emit('picker.change', change);
                });
                picker.on('showDate', function (ev) {
                    toolDayLabel.hide();
                });
                picker.on('showYM', function (ev) {
                    toolDayLabel.hide();
                });
                picker.on('showTime', function (ev) {
                    toolDayLabel.show();
                });
                picker.on('choiceDateTime', function (ev, date) {
                    var choice = dateFormat(date, setting.format);
                    if (input) {
                        input.val(choice);
                    }
                    instance.hide();
                    qem.emit('picker.choice', choice);
                });
            } else {
                picker.on('changeDate', function (ev, date) {
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    var day = date.getDate();
                    var week = date.getDay();
                    if (month == 11 || month == 12) {
                        toolMonthLabel.text(year + '年 ' + monthMap[month] + '月');
                    } else {
                        toolMonthLabel.text(year + '年 ' + monthMap[month]);
                    }
                    toolDayLabel.text(day + '日');
                    displayLabel.text(year + ' ' + dateFormat(date, 'MM-dd') + ' ' + weekMap[week]);
                    var change = dateFormat(date, setting.format);
                    qem.emit('picker.change', change);
                });
                picker.on('choiceDate', function (ev, date) {
                    var choice = dateFormat(date, setting.format);
                    if (input) {
                        input.val(choice);
                    }
                    instance.hide();
                    qem.emit('picker.choice', choice);
                });
            }
            picker.emit('showDate');
            picker.on('mousedown', function (ev) {
                ev.stopPropagation();
            });

            $(document).on('mousedown', function () {
                picker.hide();
            });
            $(window).on('blur', function () {
                picker.hide();
            });

            toolLeftBtn.on('click', function () {
                if (showType == 'Time') {
                    picker.emit('decDay');
                } else {
                    picker.emit('decMonth');
                }
            });

            toolRightBtn.on('click', function () {
                if (showType == 'Time') {
                    picker.emit('addDay');
                } else {
                    picker.emit('addMonth');
                }
            });

            toolDisplay.on('click', function () {
                if (showType == 'Date') {
                    picker.emit('showYM');
                } else {
                    picker.emit('showDate');
                }
            });

            var lock = false;
            var mousewheel = function (ev, delta) {
                if (lock) {
                    return;
                }
                lock = true;
                if (setting.useTime) {
                    if (delta == 1 && showType == 'Time') {
                        picker.emit('showDate');
                    }
                    else if (delta == 1 && showType == 'Date') {
                        picker.emit('showYM');
                    }
                    else if (delta == -1 && showType == 'YM') {
                        picker.emit('showDate');
                    }
                    else if (delta == -1 && showType == 'Date') {
                        picker.emit('showTime');
                    }
                } else {
                    if (delta == 1 && showType == 'Date') {
                        picker.emit('showYM');
                    }
                    else if (delta == -1 && showType == 'YM') {
                        picker.emit('showDate');
                    }
                }
                window.setTimeout(function () {
                    lock = false;
                }, 300);
            };
            if (window.Yee) {
                Yee.use('jquery-mousewheel').then(function () {
                    mainLayout.on('mousewheel', mousewheel);
                });
            } else if ($.fn.mousewheel) {
                mainLayout.on('mousewheel', mousewheel);
            }
            this.show = function (offset) {
                var dw = $(document).width();
                var dh = $(document).height();
                picker.show();
                if (setting.useTime) {
                    picker.emit('setDateTime', dateValue);
                } else {
                    picker.emit('setDate', dateValue);
                }
                dw = dw - picker.outerWidth(true) - 10;
                dh = dh - 300;
                if (offset.left > dw) {
                    offset.left = dw;
                }
                if (offset.top > dh) {
                    offset.top = dh;
                }
                if (offset.left < 0) {
                    offset.left = 0;
                }
                if (offset.top < 0) {
                    offset.top = 0;
                }
                picker.css({left: offset.left + 'px', top: offset.top + 'px'});
            }
            this.hide = function () {
                picker.hide();
            }
        }

        qem.on('click', function () {
            var offset = {top: 0, left: 0};
            if (input) {
                var val = input.val() || '';
                if (val) {
                    dateValue = new Date(val);
                    if (isNaN(dateValue)) {
                        dateValue = toDate(val, setting.format);
                    }
                }
                offset = input.offset();
                offset.top += input.outerHeight();
            } else {
                offset = qem.offset();
                offset.top += qem.outerHeight();
            }
            if (!dateInstance) {
                dateInstance = new DatePicker();
            }
            dateInstance.show(offset);
        });
        qem.on('picker.setTime', function (ev, date) {
            if (typeof date == 'string') {
                dateValue = new Date(date);
                if (isNaN(dateValue)) {
                    dateValue = toDate(val, setting.format);
                }
            } else if (date instanceof Date) {
                dateValue = date;
            }
            if (setting.useTime) {
                picker.emit('setDateTime', dateValue);
            } else {
                picker.emit('setDate', dateValue);
            }
        });
    }
    if (Yee) {
        Yee.extend(':input', 'picker', makePicker);
    } else {
        //jq单独使用
        $.fn.emit = function () {
            var event = arguments[0] || null;
            var args = [];
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
            }
            return $(this).triggerHandler(event, args);
        }
        $.fn.yee_picker = function (setting) {
            $(this).each(function (idx, elem) {
                makePicker(elem, setting);
            });
        }
    }
})(jQuery, window.Yee || null);