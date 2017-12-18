import { md5 } from '../tools';
import { authPayload } from '../common';
import '../tools/dict/pinyin_dict_notone.js';

import '../tools/pinyinUtil.js';
declare let pinyinUtil: any;
declare let BMap;

export class Util {
    constructor() {
        // pass
    }
    /**
     * 将input file转化成formData对象
     * @param file: Object
     * @return Object FormData对象
     */
    public getFileFormData(file) {
        let fd = new FormData();
        fd.append(file.files[0].name, file.files[0]);
        return fd;
    }
    /**
     * 发送文件时截取后缀名作为拓展字段
     * @param name string
     * @return string 后缀名
     */
    public getExt(name) {
        const index = name.lastIndexOf('.');
        return index === -1 ? '' : name.substring(index + 1);
    }
    /**
     * 将文件后缀名分类
     * @param ext string
     * @return string 后缀名
     */
    public sortByExt(ext: string) {
        if (ext === '') {
            return 'other';
        }
        const audio = ['wav', 'mp3', 'wma', 'midi'];
        const document = ['ppt', 'pptx', 'doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt', 'wps'];
        const video = ['mp4', 'mov', 'rm', 'rmvb', 'wmv', 'avi', '3gp', 'mkv'];
        const image = ['jpg', 'jpeg', 'png', 'bmp', 'gif'];
        let newType = '';
        if (audio.indexOf(ext) !== -1) {
            // 音频
            newType = 'audio';
        } else if (document.indexOf(ext) !== -1) {
            // 文档
            newType = 'document';
        } else if (video.indexOf(ext) !== -1) {
            // 视频
            newType = 'video';
        } else if (image.indexOf(ext) !== -1) {
            // 图片
            newType = 'image';
        } else {
            // 其他
            newType = 'other';
        }
        return newType;
    }
    /**
     * fileReader预览图片返回img url
     * @param file: Object, input file 对象
     * @param callback: function 回调函数
     * @param callback2: function 回调函数
     */
    public doubleNumber(num) {
        return num < 10 ? '0' + num : num;
    }
    /**
     * fileReader预览图片返回img url
     * @param file: Object, input file 对象
     * @param callback: function 回调函数
     * @param callback2: function 回调函数
     */
    public imgReader(file, callback ?: Function, callback2 ?: Function) {
        let files = file.files[0];
        if (!/image\/\w+/.test(files.type)) {
            callback();
            return false;
        }
        let reader = new FileReader();
        reader.readAsDataURL(files);
        let img = new Image();
        let promise = new Promise((resolve, reject) => {
            reader.onload = function(e){
                img.src = this.result;
                let that = this;
                img.onload = function(){
                    let width = img.naturalWidth;
                    let height = img.naturalHeight;
                    resolve({
                        src: that.result,
                        width,
                        height
                    });
                };
            };
        }).catch(() => {
            console.log('Promise Rejected');
        });
        promise.then((value) => {
            callback2(value);
        }, (error) => {
            // pass
        }).catch(() => {
            console.log('Promise Rejected');
        });
    }
    /**
     * fileReader预览图片url
     * @param file: Object, input file 对象
     * @param callback: function 回调函数
     */
    public fileReader(file, callback ?: Function) {
        let files = file.files[0];
        if (!files.type || files.type === '') {
            return false;
        }
        if (!/image\/\w+/.test(files.type)) {
            callback();
            return false;
        }
        let reader = new FileReader();
        reader.readAsDataURL(files);
        return new Promise((resolve, reject) => {
            reader.onload = function(e){
                resolve(this.result);
            };
        }).catch(() => {
            console.log('Promise Rejected');
        });
    }
    /**
     * contenteditable输入框插入内容（表情、粘贴文本等）
     * @param field: Object  输入框dom对象
     * @param value: string 需要插入的内容
     * @param selectPastedContent: boolean 选中内容还是开始点和结束点一致
     */
    public insertAtCursor (field, value, selectPastedContent) {
        let sel;
        let range;
        field.focus();
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                let el = document.createElement('div');
                el.innerHTML = value;
                let frag = document.createDocumentFragment();
                let node;
                let lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                let firstNode = frag.firstChild;
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    if (selectPastedContent) {
                        range.setStartBefore(firstNode);
                    } else {
                        range.collapse(true);
                    }
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    }
    /**
     * contenteditable输入框光标聚焦到最后
     * @param obj: Object  输入框dom对象
     */
    public focusLast(obj) {
        if (window.getSelection) { // ie11 10 ff safari
            let range = window.getSelection(); // 创建range
            range.selectAllChildren(obj); // range 选择obj下所有子内容
            range.collapse(obj, obj.childNodes.length); // 光标移至最后
        }
    }
    /**
     * 判断字符串首字母是否是中文
     * @param str: string  需要操作的字符串
     * @return boolean
     */
    public firstLetterIsChinese(str: string) {
      const re = /^[\\u4e00-\\u9fa5]/;
      if (re.test(str)) {
          return false ;
      }
      return true ;
    }
    /**
     * 将数组中的字符串按照首字母及中文拼音首字母排序
     * @param payload: array 需要排序的数组
     * @return array 排好序的数组array
     */
    public sortByLetter(payload) {
        let letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
            'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
        let result = [];
        for (let item of letter) {
            result.push({
                letter: item,
                data: []
            });
        }
        for (let item of payload) {
            let flag = false;
            for (let re of result) {
                let name;
                if (item.memo_name && item.memo_name !== '') {
                    name = item.memo_name;
                } else if (item.nickName && item.nickName !== '') {
                    name = item.nickName;
                } else {
                    name = item.name;
                }
                if (!name || name.length === 0) {
                    break;
                }
                let firstLetter = name.charAt(0);
                if (name.match(/^[a-zA-Z]/)) {
                    if (firstLetter.toUpperCase() === re.letter) {
                        re.data.push(item);
                        flag = true;
                        break;
                    }
                }else if (this.firstLetterIsChinese(name)) {
                    let py = pinyinUtil.getFirstLetter(name, false)[0];
                    if (py && py.toUpperCase() === re.letter) {
                        re.data.push(item);
                        flag = true;
                        break;
                    }
                }
            }
            if (!flag) {
                result[result.length - 1].data.push(item);
            }
        }
        return result;
    }
    /**
     * 将元素插入按首字母排序的数组中
     * @param arr: array 之前排好序的数组
     * @param payload: Object  需要插入的元素
     * @return array 插入元素之后的数组
     */
    public insertSortByLetter(arr, payload) {
        let name = (payload.nickName && payload.nickName !== '') ? payload.nickName : payload.name;
        let firstLetter = this.getFirstLetter(name);
        for (let item of arr) {
            if (item.letter === firstLetter) {
                let result = item.data.filter((friend) => {
                    return friend.name === payload.name;
                });
                if (result.length === 0) {
                    item.data.push(payload);
                }
                break;
            }
        }
        return arr;
    }
    /**
     * 获取首字母
     */
    public getFirstLetter(name) {
        let firstLetter = name.charAt(0);
        if (name.match(/^[a-zA-Z]/)) {
            firstLetter = firstLetter.toUpperCase();
        } else if (this.firstLetterIsChinese(name)) {
            let py = pinyinUtil.getFirstLetter(firstLetter, false)[0];
            if (py) {
                firstLetter = py.toUpperCase();
            } else {
                firstLetter = '#';
            }
        } else {
            firstLetter = '#';
        }
        return firstLetter;
    }
    public getMembersFirstLetter(arr) {
        for (let item of arr) {
            if (item.nickName && item.nickName !== '') {
                item.nickNameFirstLetter = this.getFirstLetter(item.nickName);
            }
            if (item.username && item.username !== '') {
                item.usernameFirstLetter = this.getFirstLetter(item.username);
            }
            if (item.memo_name && item.memo_name !== '') {
                item.memo_nameFirstLetter = this.getFirstLetter(item.memo_name);
            }
        }
    }
    public getMemo_nameFirstLetter(member) {
        if (member.memo_name && member.memo_name !== '') {
            member.memo_nameFirstLetter = this.getFirstLetter(member.memo_name);
        }
    }
    /**
     * 将接收到的地理定位坐标转化为地图
     * @param obj: Object 坐标对象
     */
    public theLocation(obj) {
        // 地图API功能
        let point = new BMap.Point(obj.longitude, obj.latitude);
        let map = new BMap.Map(obj.id);
        map.centerAndZoom(point, 13);
        if (obj.scroll) {
            map.enableScrollWheelZoom(true);
        }
        let marker = new BMap.Marker(point);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        map.panTo(point);
    }
    /**
     * 将时间转化成需要的格式
     * @param msgTime: 需要转换的时间毫秒数
     * @return string 时间的标识，根据标识可以再页面应用不同的date管道
     * 当天 --- today
     * 昨天和前天 --- yesterday或the day before
     * 近7天（排除今天，昨天，前天） --- day
     * 今年其他时间 --- month
     * 今年之前的时间 --- year
     */
    public reducerDate(msgTime) {
        const time = new Date(msgTime);
        const now = new Date();
        const msgYear = time.getFullYear();
        const nowYear = now.getFullYear();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();
        const nowSecond = now.getSeconds();
        const nowTime = now.getTime();
        const todayTime = nowHour * 60 * 1000 * 60 + nowMinute * 1000 * 60 + nowSecond * 1000;
        const gapDate = (nowTime - todayTime - msgTime) / 1000 / 60 / 60 / 24;
        let showTime = '';
        if (msgYear !== nowYear) {
            showTime = 'year';
        } else if (gapDate > 6) {
            showTime = 'month';
        } else if (gapDate <= 6 && gapDate > 2) {
            showTime = 'day';
        } else if (gapDate <= 2 && gapDate > 1) {
            showTime = 'the day before';
        } else if (gapDate <= 1 && gapDate > 0) {
            showTime = 'yesterday';
        } else if (gapDate <= 0) {
            showTime = 'today';
        } else {
            showTime = '';
        }
        return showTime;
    }
    /**
     * 判断两个时间间隔是否超过5分钟
     * @param oldTime: number
     * @param newTime: number
     * @return boolean
     */
    public fiveMinutes(oldTime, newTime) {
        const gap = newTime - oldTime;
        if (gap / 1000 / 60 > 5) {
            return true;
        }
        return false;
    }
    /**
     * 获取当前光标的在页面中的位置
     * @param input: dom obj 输入框的dom元素
     * @return object 光标的位置
     */
    public getOffset(input) {
        let userAgent = navigator.userAgent;
        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        let offset;
        let isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1;
        if (!isSafari) {
            offset = range.getBoundingClientRect();
        } else {
            let  clonedRange;
            let  rect;
            let shadowCaret;
            clonedRange = range.cloneRange();
            clonedRange.setStart(range.endContainer, range.endOffset - 1);
            clonedRange.setEnd(range.endContainer, range.endOffset);
            rect = clonedRange.getBoundingClientRect();
            offset = {
                height: rect.height,
                left: rect.left + rect.width,
                top: rect.top
            };
            clonedRange.detach();
            if (input.innerHTML === '@') {
                clonedRange = range.cloneRange();
                shadowCaret = document.createTextNode('|');
                clonedRange.insertNode(shadowCaret);
                clonedRange.selectNode(shadowCaret);
                rect = clonedRange.getBoundingClientRect();
                offset = {
                    height: rect.height,
                    left: rect.left,
                    top: rect.top
                };
                input.innerHTML = '@';
                this.focusLast(input);
                clonedRange.detach();
            }
        }
        return offset;
    }
    /**
     * 深度拷贝对象
     * @param obj: object 需要拷贝的对象
     * @return result 新的对象
     */
    public deepCopyObj(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     * 生成JIM初始化的签名
     * @param timestamp: number 当前的时间毫秒数
     * @return string 签名
     */
    public createSignature(timestamp: number) {
        return md5(`appkey=${authPayload.appKey}&timestamp=${timestamp}&random_str=${authPayload.randomStr}&key=${authPayload.masterSecret}`);
    }
}
