import {Yee} from "../yee";
import {YeeEvent} from "./yee-event";


export class YeePicker extends YeeEvent {

    public static monthMap = {
        1: '一月',
        2: '二月',
        3: '三月',
        4: '四月',
        5: '五月',
        6: '六月',
        7: '七月',
        8: '八月',
        9: '九月',
        10: '十月',
        11: '十一',
        12: '十二'
    };
    public static weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    private static zeroize(value, length = 2) {
        let zeros = '';
        value = String(value);
        for (let i = 0; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    }

    public static dateFormat(date, format: string = 'yyyy-MM-dd'): string {
        let mask = format.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|(?:yyyy|yy)|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
            switch ($0) {
                case 'd':
                    return date.getDate();
                case 'dd':
                    return YeePicker.zeroize(date.getDate());
                case 'ddd':
                    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()];
                case 'dddd':
                    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                case 'M':
                    return date.getMonth() + 1;
                case 'MM':
                    return YeePicker.zeroize(date.getMonth() + 1);
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
                    return YeePicker.zeroize(date.getHours() % 12 || 12);
                case 'H':
                    return date.getHours();
                case 'HH':
                    return YeePicker.zeroize(date.getHours());
                case 'm':
                    return date.getMinutes();
                case 'mm':
                    return YeePicker.zeroize(date.getMinutes());
                case 's':
                    return date.getSeconds();
                case 'ss':
                    return YeePicker.zeroize(date.getSeconds());
                case 'l':
                    return YeePicker.zeroize(date.getMilliseconds(), 3);
                case 'L':
                    let m = date.getMilliseconds();
                    if (m > 99) m = Math.round(m / 10);
                    return YeePicker.zeroize(m);
                case 'tt':
                    return date.getHours() < 12 ? 'am' : 'pm';
                case 'TT':
                    return date.getHours() < 12 ? 'AM' : 'PM';
                default:
                    return $0.substr(1, $0.length - 2);
            }
        });
        return mask;
    }

    public static toDate(str: string, format: string = 'yyyy-MM-dd') {
        let temp1 = format.split(/(yyyy|MMMM|dddd|MMM|ddd|yy|MM|dd|HH|mm|ss|TT|tt|hh|M|d|H|m|s|h|L|l|Z)/);
        let keys = {};
        let index = 0;
        for (let i = 0; i < temp1.length; i++) {
            let key = temp1[i];
            let val = '';
            switch (key) {
                case 'yyyy' :
                    val = keys['yyyy'] = str.substr(index, 4);
                    break;
                case 'ddd':
                case 'MMM':
                    val = keys[key] = str.substr(index, 3);
                    break;
                case 'dddd':
                    let char1 = str.substr(index, 2).toLowerCase();
                    switch (char1) {
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
                    let char2 = str.substr(index, 3).toLowerCase();
                    switch (char2) {
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
                    let d = str.substr(index + 1, 1);
                    if (/^\d$/.test(d)) {
                        val = keys[key] = str.substr(index, 2);
                    } else {
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
        let args = {};
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
            let temps = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            let tkey = keys['MMM'].toLowerCase();
            for (let i = 0; i < temps.length; i++) {
                if (temps[i] == tkey) {
                    args['MM'] = i + 1;
                    break;
                }
            }
        }
        if (!args['MM'] && keys['MMMM']) {
            let temps = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            let tkey = keys['MMMM'].toLowerCase();
            for (let i = 0; i < temps.length; i++) {
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
            let hh = parseInt(keys['hh']);
            args['HH'] = hh;
            if (args['tt'] && args['tt'] == 'pm') {
                if (hh != 12) {
                    args['HH'] = hh + 12;
                }
            } else {
                if (hh == 12) {
                    args['HH'] = 0;
                }
            }
        }
        if (!args['HH'] && keys['h'] && /^\d+$/.test(keys['h'])) {
            let h = parseInt(keys['h']);
            args['HH'] = parseInt(keys['h']);
            if (args['tt'] && args['tt'] == 'pm') {
                if (h != 12) {
                    args['HH'] = h + 12;
                }
            } else {
                if (h == 12) {
                    args['HH'] = 0;
                }
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

    public static getDayMap(dataYear, dataMonth) {
        let lastDay = new Date(dataYear, dataMonth, 0).getDate();
        let dayMap = [];
        let weekMap = [0, 0, 0, 0, 0, 0, 0];
        for (let day = 1; day <= lastDay; day++) {
            let week = new Date(dataYear, dataMonth - 1, day).getDay();
            weekMap[week] = day;
            if (week == 6 || day == lastDay) {
                dayMap.push(weekMap);
                weekMap = [0, 0, 0, 0, 0, 0, 0];
            }
        }
        return dayMap;
    }

    private setting;
    private readonly qem;
    private input;
    private readonly picker;
    private readonly mainLayout;
    private showType = '';
    private dateValue = null;

    public constructor(elem, setting) {
        super();
        this.setting = setting;
        let qem = this.qem = $(elem);
        this.input = this.qem;
        let that = this;
        if (!this.qem.is(':input')) {
            if (setting['input']) {
                this.input = $(setting['input']);
            }
        }
        this.input.attr('autocomplete', 'off');

        let picker = this.picker = $('<div class="yee-picker"></div>').hide().appendTo(document.body);
        let displayLabel = $('<div class="yee-picker-display"></div>').appendTo(picker);
        let toolbarLayout = $('<div class="yee-picker-toolbar"></div>').appendTo(picker);
        this.mainLayout = $('<div class="yee-picker-main"></div>').appendTo(picker);

        this.mainLayout.on('dragstart ondragenter drag dragend dblclick', function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            ev.cancelBubble = true;
            ev.returnValue = false;
            return false;
        });

        let toolLeftBtn = $('<button><svg viewBox="0 0 24 24" class="yee-picker-svg-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button>').appendTo(toolbarLayout);
        let toolDisplay = $('<div class="yee-picker-year"></div>').appendTo(toolbarLayout);
        let toolLabel = $('<a class="yee-picker-year-btn" href="javascript:;"></a>').appendTo(toolDisplay);
        let toolMonthLabel = $('<span></span>').appendTo(toolLabel);
        let toolDayLabel = $('<span></span>').hide().appendTo(toolLabel);
        let toolRightBtn = $('<button><svg viewBox="0 0 24 24" class="yee-picker-svg-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></button>').appendTo(toolbarLayout);

        this.createYMBox();
        this.createDateBox();

        if (this.setting.useTime) {
            if (!that.setting.format) {
                that.setting.format = 'yyyy-MM-dd HH:mm:ss';
            }
            this.createTimeBox();
            that.on('changeDateTime', function (date) {
                // console.log('changeDateTime', date);
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                let day = date.getDate();
                let week = date.getDay();
                if (month == 11 || month == 12) {
                    toolMonthLabel.text(year + '年 ' + YeePicker.monthMap[month] + '月');
                } else {
                    toolMonthLabel.text(year + '年 ' + YeePicker.monthMap[month]);
                }
                toolDayLabel.text(day + '日');
                displayLabel.text(year + ' ' + YeePicker.dateFormat(date, 'MM-dd HH:mm:ss') + ' ' + YeePicker.weekMap[week]);
                let change = YeePicker.dateFormat(date, that.setting.format);
                //console.log('picker.change', change);
                that.emit('picker.change', change);
            });
            that.on('showDate', function () {
                toolDayLabel.hide();
            });
            that.on('showYM', function () {
                toolDayLabel.hide();
            });
            that.on('showTime', function () {
                toolDayLabel.show();
            });
            that.on('choiceDateTime', function (date) {
                let choice = YeePicker.dateFormat(date, that.setting.format);
                if (that.input) {
                    that.input.val(choice);
                }
                that.hide();
                that.emit('picker.choice', choice);
            });
        } else {
            //  console.log('222', option.useTime);
            that.on('changeDate', function (date) {
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                let day = date.getDate();
                let week = date.getDay();
                if (month == 11 || month == 12) {
                    toolMonthLabel.text(year + '年 ' + YeePicker.monthMap[month] + '月');
                } else {
                    toolMonthLabel.text(year + '年 ' + YeePicker.monthMap[month]);
                }
                toolDayLabel.text(day + '日');
                displayLabel.text(year + ' ' + YeePicker.dateFormat(date, 'MM-dd') + ' ' + YeePicker.weekMap[week]);
                let change = YeePicker.dateFormat(date, that.setting.format);
                that.emit('picker.change', change);
            });
            that.on('choiceDate', function (date) {
                let choice = YeePicker.dateFormat(date, that.setting.format);
                if (that.input) {
                    that.input.val(choice);
                }
                that.hide();
                that.emit('picker.choice', choice);
            });
        }
        that.emit('showDate');
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
            if (that.showType == 'Time') {
                that.emit('decDay');
            } else {
                that.emit('decMonth');
            }
        });

        toolRightBtn.on('click', function () {
            if (that.showType == 'Time') {
                that.emit('addDay');
            } else {
                that.emit('addMonth');
            }
        });

        toolDisplay.on('click', function () {
            if (that.showType == 'Date') {
                that.emit('showYM');
            } else {
                that.emit('showDate');
            }
        });

        let lock = false;
        let mousewheel = function (ev, delta) {
            if (lock) {
                return;
            }
            lock = true;
            if (that.setting.useTime) {
                if (delta == 1 && that.showType == 'Time') {
                    that.emit('showDate');
                } else if (delta == 1 && that.showType == 'Date') {
                    that.emit('showYM');
                } else if (delta == -1 && that.showType == 'YM') {
                    that.emit('showDate');
                } else if (delta == -1 && that.showType == 'Date') {
                    that.emit('showTime');
                }
            } else {
                if (delta == 1 && that.showType == 'Date') {
                    that.emit('showYM');
                } else if (delta == -1 && that.showType == 'YM') {
                    that.emit('showDate');
                }
            }
            window.setTimeout(function () {
                lock = false;
            }, 300);
        };
        Yee.use('jquery-mousewheel').then(function () {
            that.mainLayout.on('mousewheel', mousewheel);
        });

        qem.on('click', function () {
            let offset = {top: 0, left: 0};
            if (that.input) {
                let val = that.input.val() || '';
                if (val) {
                    that.dateValue = new Date(val);
                    if (isNaN(that.dateValue)) {
                        that.dateValue = YeePicker.toDate(val, that.setting.format);
                    }
                }
                offset = that.input.offset();
                offset.top += that.input.outerHeight();
            } else {
                offset = qem.offset();
                offset.top += qem.outerHeight();
            }
            that.show(offset);
        });

        qem.on('setTime', function (ev, date) {
            if (typeof date == 'string') {
                that.dateValue = new Date(date);
                if (isNaN(that.dateValue)) {
                    that.dateValue = YeePicker.toDate(that.dateValue, that.setting.format);
                }
            } else if (date instanceof Date) {
                that.dateValue = date;
            }
            if (that.setting.useTime) {
                that.emit('setDateTime', that.dateValue);
            } else {
                that.emit('setDate', that.dateValue);
            }
        });
    }

    public createYMBox() {
        let that = this;
        let mainLayout = this.mainLayout;
        let baseBox = $('<div class="yee-picker-sel-year-month"></div>').appendTo(mainLayout);
        let tempA = $('<a class="yee-picker-year-layout" href="javascript:;"></a>').appendTo(baseBox);
        let selYearBox = $('<div class="yee-picker-sel-year"></div>').appendTo(tempA);
        let selMonthBox = $('<div class="yee-picker-sel-month"></div>').appendTo(baseBox);

        Yee.use('jquery-mousewheel').then(function () {
            selYearBox.on('mousewheel', function (ev) {
                ev.stopPropagation();
            });
        });

        let ul = $('<ul></ul>').appendTo(selYearBox);
        let curYear = new Date().getFullYear();
        let startYear = curYear - 100;
        let endYear = curYear + 100;
        for (let i = startYear; i < endYear; i++) {
            let li = $('<li index="' + i + '"></li>').text(i).appendTo(ul);
            li.on('click', i, function (ev) {
                that.emit('setYear', ev.data);
            });
        }
        let n = 0;
        for (let i = 0; i < 6; i++) {
            let div = $('<div></div>').appendTo(selMonthBox);
            for (let j = 0; j < 2; j++) {
                let m = ++n;
                let btn = $('<button></button>').text(YeePicker.monthMap[m]).appendTo(div);
                btn.on('click', m, function (ev) {
                    that.emit('setMonth', ev.data);
                    that.emit('showDate');
                });
            }
        }
        //事件==========
        that.on('setYear', function (year) {
            ul.find('li').removeClass('yee-picker-current');
            let currentLi = ul.find('li[index="' + year + '"]');
            if (currentLi.length > 0) {
                currentLi.addClass('yee-picker-current');
                $(function () {
                    let utop = ul.position().top;
                    let top = currentLi.position().top - 65;
                    top = top - utop;
                    selYearBox.animate({scrollTop: top}, 200);
                });
            }
        });
        that.on('setMonth', function (month) {
            let btns = selMonthBox.find('button').removeClass('yee-picker-current');
            btns.eq(month - 1).addClass('yee-picker-current');

        });

        that.on('showYM', function () {
            if (that.showType == 'YM') {
                return;
            }
            that.showType = 'YM';
            $(function () {
                let height = baseBox.outerHeight(true);
                mainLayout.height(height);
                mainLayout.animate({scrollTop: 0}, 200, 'swing');
            });
        });
        return baseBox;
    }

    public createDateBox() {
        let that = this;
        let mainLayout = this.mainLayout;

        let dataYear = 0;
        let dataMonth = 0;
        let dateDay = 0;
        let baseBox = $('<div class="yee-picker-sel-day"></div>').appendTo(mainLayout);
        $('<div class="yee-picker-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>').appendTo(baseBox);

        that.on('setDate', function (date) {
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            if (year == dataYear && month == dataMonth && day == dateDay) {
                return;
            }
            if (dataYear == year && dataMonth == month) {
                that.emit('setDay', day);
            } else {
                dateDay = day;
            }
            if (year != dataYear) {
                dataMonth = 0;
                that.emit('setYear', year);
            }
            if (month != dataMonth) {
                that.emit('setMonth', month);
            }
        });

        that.on('setYear', function (year) {
            if (year == dataYear) {
                return;
            }
            dataYear = year;
            if (dataMonth == 0) {
                return;
            }
            let lastDay = new Date(dataYear, dataMonth, 0).getDate();
            if (dateDay > lastDay) {
                that.emit('resetDay', lastDay);
                return;
            }
            that.emit('resetDay', dateDay);
        });

        that.on('setMonth', function (month) {
            if (month == dataMonth) {
                return;
            }
            dataMonth = month;
            let lastDay = new Date(dataYear, dataMonth, 0).getDate();
            if (dateDay > lastDay) {
                that.emit('resetDay', lastDay);
                return;
            }
            that.emit('resetDay', dateDay);
        });

        that.on('resetDay', function (day) {
            if (dataYear == 0 || dataMonth == 0) {
                return;
            }
            baseBox.find('div.yee-picker-day-row').remove();
            let dayMap = YeePicker.getDayMap(dataYear, dataMonth);
            for (let i = 0; i < dayMap.length; i++) {
                let weekMap = dayMap[i];
                let row = $('<div class="yee-picker-day-row"></div>').appendTo(baseBox);
                for (let j = 0; j < weekMap.length; j++) {
                    let d = weekMap[j];
                    if (d == 0) {
                        $('<span>').appendTo(row);
                    } else {
                        let btn = $('<button index="' + d + '"></button>').appendTo(row);
                        $('<span></span>').text(d).appendTo(btn);
                        btn.on('click', d, function (ev) {
                            that.emit('setDay', ev.data);
                            if (that.setting.useTime) {
                                that.emit('showTime');
                            } else {
                                setTimeout(function () {
                                    let date = new Date(dataYear, dataMonth - 1, dateDay);
                                    that.emit('choiceDate', date);
                                }, 10);
                            }
                        });
                    }
                }
            }
            if (dayMap.length < 6) {
                let row = $('<div class="yee-picker-day-row"></div>').appendTo(baseBox);
                $('<span></span>').appendTo(row);
                let btn = $('<button class="yee-picker-today"><span>今天</span></button>').appendTo(row);
                btn.on('click', function (ev) {
                    that.emit('setDate', new Date());
                    if (!that.setting.useTime) {
                        that.emit('choiceDate', new Date());
                    }
                });
            } else {
                let row = baseBox.find('div.yee-picker-day-row:last');
                let btn = $('<button class="yee-picker-today"><span>今天</span></button>').appendTo(row);
                btn.on('click', function (ev) {
                    that.emit('setDate', new Date());
                    if (!that.setting.useTime) {
                        that.emit('choiceDate', new Date());
                    }
                });
            }
            that.emit('setDay', day);
            if (that.showType == 'Date') {
                that.emit('showDate', true);
            }
            if (that.showType == 'Time') {
                that.emit('showTime', true);
            }
        });

        that.on('setDay', function (day) {
            dateDay = day;
            let btns = baseBox.find('div.yee-picker-day-row button').removeClass('yee-picker-current');
            btns.filter('[index="' + day + '"]').addClass('yee-picker-current');
            let date = new Date(dataYear, dataMonth - 1, dateDay);
            that.emit('changeDate', date);
        });

        that.on('addMonth', function () {
            if (dataMonth == 0 || dataYear == 0) {
                return;
            }
            let month = dataMonth + 1;
            let year = dataYear;
            if (month > 12) {
                month -= 12;
                year += 1;
            }
            if (year != dataYear) {
                that.emit('setYear', year);
            }
            that.emit('setMonth', month);
        });

        that.on('decMonth', function () {
            if (dataMonth == 0 || dataYear == 0) {
                return;
            }
            let month = dataMonth - 1;
            let year = dataYear;
            if (month < 1) {
                month = 12;
                year -= 1;
            }
            if (year != dataYear) {
                that.emit('setYear', year);
            }
            that.emit('setMonth', month);
        });

        that.on('addDay', function () {
            if (dateDay == 0 || dataMonth == 0 || dataYear == 0) {
                return;
            }
            let lastDay = new Date(dataYear, dataMonth - 1, 0).getDate();//当前最后一天
            let day = dateDay + 1;
            if (day > lastDay) {
                that.emit('addMonth');
                that.emit('setDay', 1);
                return;
            }
            that.emit('setDay', day);
        });

        that.on('decDay', function () {
            if (dateDay == 0 || dataMonth == 0 || dataYear == 0) {
                return;
            }
            let day = dateDay - 1;
            if (day < 1) {
                that.emit('decMonth');
                let lastDay = new Date(dataYear, dataMonth - 1, 0).getDate();
                that.emit('setDay', lastDay);
                return;
            }
            that.emit('setDay', day);
        });

        let firstShow = true;
        that.on('showDate', function (force) {
            if (!force && that.showType == 'Date') {
                return;
            }
            that.showType = 'Date';
            let height = baseBox.outerHeight(true);
            if (that.setting.useTime) {
                height += 30;
            } else {
                height += 5;
            }
            mainLayout.height(height);
            let top = baseBox.position().top + mainLayout.scrollTop();
            if (force || firstShow) {
                firstShow = false;
                mainLayout.scrollTop(top);
            } else {
                mainLayout.animate({scrollTop: top}, 200, 'swing');
            }
        });
        return baseBox;
    }

    public createTimeBox() {

        let that = this;
        let mainLayout = this.mainLayout;

        let dateHour = -1;
        let dateMinute = -1;
        let dateSecond = -1;
        let dataDate = null;

        let baseBox = $('<div class="yee-picker-sel-hms"></div>').appendTo(mainLayout);
        let displayBox = $('<div class="yee-picker-time-display"></div>').appendTo(baseBox);
        let btn1 = $('<button class="yee-picker-time"><span>时间 <b>08:20:26</b></span></button>').appendTo(displayBox);
        let btn2 = $('<button class="yee-picker-time-choice"><span>确定选择</span></button>').appendTo(displayBox);
        let btn3 = $('<button class="yee-picker-now"><span>现在</span></button>').appendTo(displayBox);
        let layout = $('<div class="yee-picker-sel-hms-layout"></div>').appendTo(baseBox);
        let hourBox = $('<div class="yee-picker-sel-hour"></div>').appendTo(layout);
        $('<div class="yee-picker-sel-apart"></div>').appendTo(layout);
        let minuteBox = $('<div class="yee-picker-sel-minute"></div>').appendTo(layout);
        $('<div class="yee-picker-sel-apart"></div>').appendTo(layout);
        let secondBox = $('<div class="yee-picker-sel-second"></div>').appendTo(layout);
        let item1 = $('<div></div>').appendTo(hourBox);

        let decBtn1 = $('<button>-</button>').appendTo(item1);
        let addBtn1 = $('<button>+</button>').appendTo(item1);


        function changeDateTime() {
            if (dateHour < 0 || dateMinute < 0 || dateSecond < 0) {
                return;
            }
            let th = YeePicker.zeroize(dateHour);
            let tm = YeePicker.zeroize(dateMinute);
            let ts = YeePicker.zeroize(dateSecond);
            btn1.find('span b').text(th + ':' + tm + ':' + ts);
            let dataTime = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate(), dateHour, dateMinute, dateSecond);
            that.emit('changeDateTime', dataTime);
        }

        btn2.on('click', function () {
            if (dateHour < 0 || dateMinute < 0 || dateSecond < 0) {
                return;
            }
            let th = YeePicker.zeroize(dateHour);
            let tm = YeePicker.zeroize(dateMinute);
            let ts = YeePicker.zeroize(dateSecond);
            btn1.find('span b').text(th + ':' + tm + ':' + ts);
            let dateTime = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate(), dateHour, dateMinute, dateSecond);
            that.emit('choiceDateTime', dateTime);
        });

        that.on('changeDate', function (date) {
            dataDate = date;
            changeDateTime();
        });

        let h = 0;
        for (let i = 0; i < 6; i++) {
            let item = $('<div></div>').appendTo(hourBox);
            for (let j = 0; j < 4; j++) {
                let text = YeePicker.zeroize(h);
                let button = $('<button></button>').attr('index', h).text(text).appendTo(item);
                button.on('click', h, function (ev) {
                    that.emit('setHour', ev.data);
                });
                h++;
            }
        }
        let item2 = $('<div></div>').appendTo(minuteBox);
        let decBtn2 = $('<button>-</button>').appendTo(item2);
        let addBtn2 = $('<button>+</button>').appendTo(item2);

        let m = 0;
        for (let i = 0; i < 6; i++) {
            let item = $('<div></div>').appendTo(minuteBox);
            for (let j = 0; j < 2; j++) {
                let text = YeePicker.zeroize(m);
                let button = $('<button></button>').attr('index', m).text(text).appendTo(item);
                button.on('click', m, function (ev) {
                    that.emit('setMinute', ev.data);
                });
                m += 5;
            }
        }
        let item3 = $('<div></div>').appendTo(secondBox);
        let decBtn3 = $('<button>-</button>').appendTo(item3);
        let addBtn3 = $('<button>+</button>').appendTo(item3);
        let s = 0;
        for (let i = 0; i < 6; i++) {
            let item = $('<div></div>').appendTo(secondBox);
            for (let j = 0; j < 2; j++) {
                let text = YeePicker.zeroize(s);
                let button = $('<button></button>').attr('index', s).text(text).appendTo(item);
                button.on('click', s, function (ev) {
                    that.emit('setSecond', ev.data);
                });
                s += 5;
            }
        }
        that.on('showTime', function (force) {
            if (!force && that.showType == 'Time') {
                return;
            }
            that.showType = 'Time';
            let height = baseBox.outerHeight(true);
            height += 10;
            mainLayout.height(height);
            let top = baseBox.position().top + mainLayout.scrollTop() - 5;
            if (force) {
                mainLayout.scrollTop(top);
            } else {
                mainLayout.animate({scrollTop: top}, 200, 'swing');
            }
        });

        //设置小时
        let setHour = function (hour) {
            dateHour = hour;
            let btns = hourBox.find('button').removeClass('yee-picker-current');
            btns.filter('[index="' + hour + '"]').addClass('yee-picker-current');
        };
        //设置秒
        let setSecond = function (second) {
            dateSecond = second;
            let leq = secondBox.find('button.yee-picker-current').removeClass('yee-picker-current');
            let lt = leq.attr('index');
            let ltext = YeePicker.zeroize(lt);
            leq.text(ltext);
            let t = Math.floor(second / 5) * 5;
            let em = secondBox.find('button[index="' + t + '"]').addClass('yee-picker-current');
            let text = YeePicker.zeroize(second);
            em.text(text);
        }
        //设置分钟
        let setMinute = function (minute) {
            if (dateMinute != minute) {
                dateMinute = minute;
                let leq = minuteBox.find('button.yee-picker-current').removeClass('yee-picker-current');
                let lt = leq.attr('index');
                let ltext = YeePicker.zeroize(lt);
                leq.text(ltext);
                let t = Math.floor(minute / 5) * 5;
                let em = minuteBox.find('button[index="' + t + '"]').addClass('yee-picker-current');
                let text = YeePicker.zeroize(minute);
                em.text(text);
                setSecond(0);
                return;
            }
        };

        let setDateTime = function (date) {
            let hour = date.getHours();
            let minute = date.getMinutes();
            let second = date.getSeconds();
            dataDate = date;
            that.emit('setDate', date);
            if (hour == dateHour && minute == dateMinute && second == dateSecond) {
                return;
            }
            if (hour != dateHour) {
                setHour(hour);
                that.emit('setHour', hour);
            }
            if (minute != dateMinute) {
                setMinute(minute);
            }
            if (second != dateSecond) {
                setSecond(minute);
            }
            changeDateTime();
        }

        btn3.on('click', function () {
            let date = new Date();
            setDateTime(date);
        });
        that.on('setDateTime', function (date) {
            setDateTime(date);
        });
        that.on('setHour', function (hour) {
            setHour(hour);
            changeDateTime();
        });
        that.on('setMinute', function (minute, force = false) {
            setMinute(minute);
            changeDateTime();
        });
        that.on('setSecond', function (second, force = false) {
            if (dateSecond == second) {
                if (force) {
                    changeDateTime();
                }
                return;
            }
            setSecond(second);
            changeDateTime();
        });
        that.on('addHour', function () {
            if (dateHour < 0) {
                return;
            }
            let hour = dateHour + 1;
            if (hour > 23) {
                hour = 0;
                that.emit('addDay');
            }
            that.emit('setHour', hour);
        });
        addBtn1.on('click', function () {
            that.emit('addHour');
        });
        that.on('decHour', function () {
            if (dateHour < 0) {
                return;
            }
            let hour = dateHour - 1;
            if (hour < 0) {
                hour = 23;
                that.emit('decDay');
            }
            that.emit('setHour', hour);
        });
        decBtn1.on('click', function () {
            that.emit('decHour');
        });
        that.on('addMinute', function () {
            if (dateMinute < 0) {
                return;
            }
            let minute = dateMinute + 1;
            if (minute > 59) {
                minute = 0;
                that.emit('addHour');
            }
            that.emit('setMinute', minute);
        });
        addBtn2.on('click', function () {
            that.emit('addMinute');
        });
        that.on('decMinute', function () {
            if (dateMinute < 0) {
                return;
            }
            let minute = dateMinute - 1;
            if (minute < 0) {
                minute = 59;
                that.emit('decHour');
            }
            that.emit('setMinute', minute);
        });
        decBtn2.on('click', function () {
            that.emit('decMinute');
        });

        that.on('addSecond', function () {
            if (dateSecond < 0) {
                return;
            }
            let second = dateSecond + 1;
            if (second > 59) {
                second = 0;
                that.emit('addMinute');
            }
            that.emit('setSecond', second);
        });

        addBtn3.on('click', function () {
            that.emit('addSecond');
        });

        that.on('decSecond', function () {
            if (dateSecond < 0) {
                return;
            }
            let second = dateSecond - 1;
            if (second < 0) {
                second = 59;
                that.emit('decMinute');
            }
            that.emit('setSecond', second);
        });

        decBtn3.on('click', function () {
            that.emit('decSecond');
        });

        btn1.on('click', function () {
            if (that.showType == 'Date') {
                that.emit('showTime');
            } else {
                that.emit('showDate');
            }
        });

    }

    public show(offset) {
        let dw = $(document).width();
        let dh = $(document).height();
        this.picker.show();
        let time = this.dateValue || new Date();
        if (this.setting.useTime) {
            this.emit('setDateTime', time);
        } else {
            this.emit('setDate', time);
        }
        dw = dw - this.picker.outerWidth(true) - 10;
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
        this.picker.css({left: offset.left + 'px', top: offset.top + 'px'});
    }

    public hide() {
        this.picker.hide();
    }

}

