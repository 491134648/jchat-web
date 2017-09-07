import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { appAction } from '../../../actions';

import { global, authPayload } from '../../../services/common';
import { AppStore } from '../../../app.store';
import { contactAction } from '../actions';

@Injectable()

export class ContactEffect {
    // 获取群组列表
    @Effect()
    private getGroupList$: Observable<Action> = this.actions$
        .ofType(contactAction.getGroupList)
        .map(toPayload)
        .switchMap(() => {
            const groupListObj = global.JIM.getGroups()
            .onSuccess((data) => {
                let groupList = data.group_list;
                let flag = false;
                // 解决移动端有些群聊没有用户名的问题
                for (let group of groupList) {
                    if (!group.name || group.name === '') {
                        flag = true;
                        global.JIM.getGroupMembers({gid: group.gid})
                        .onSuccess((member) => {
                            let memberList = member.member_list;
                            let name = '';
                            for (let j = 0; j < memberList.length && j < 5; j++) {
                                name = name + memberList[j].username;
                                let length = memberList.length < 5 ? memberList.length : 5;
                                if (j < length - 1) {
                                    name += '、';
                                }
                            }
                            group.name = name.substr(0, 20);
                            this.store$.dispatch({
                                type: contactAction.getGroupListSuccess,
                                payload: groupList
                            });
                        }).onFail((error) => {
                            this.store$.dispatch({
                                type: appAction.errorApiTip,
                                payload: error
                            });
                            group.name = '#群名获取失败？？';
                            this.store$.dispatch({
                                type: contactAction.getGroupListSuccess,
                                payload: groupList
                            });
                        });
                    }
                }
                if (!flag) {
                    this.store$.dispatch({
                        type: contactAction.getGroupListSuccess,
                        payload: groupList
                    });
                }
            }).onFail((error) => {
                this.store$.dispatch({
                    type: appAction.errorApiTip,
                    payload: error
                });
            });
            return Observable.of(groupListObj)
                    .map(() => {
                        return {type: '[main] get group list useless'};
                    });
        });
    // 获取好友列表
    @Effect()
    private getFriendList$: Observable<Action> = this.actions$
        .ofType(contactAction.getFriendList)
        .map(toPayload)
        .switchMap(() => {
            const friendListObj = global.JIM.getFriendList()
                .onSuccess((data) => {
                    console.log(3333333, data.friend_list);
                    this.store$.dispatch({
                        type: contactAction.getFriendListSuccess,
                        payload: data.friend_list
                    });
                    for (let friend of data.friend_list) {
                        if (friend.avatar === '') {
                            continue;
                        }
                        global.JIM.getResource({media_id: friend.avatar})
                        .onSuccess((urlInfo) => {
                            friend.avatarUrl = urlInfo.url;
                            this.store$.dispatch({
                                type: contactAction.getFriendListSuccess,
                                payload: data.friend_list
                            });
                        }).onFail((error) => {
                            // pass
                        });
                    }
                }).onFail((error) => {
                    this.store$.dispatch({
                        type: appAction.errorApiTip,
                        payload: error
                    });
                });
            return Observable.of(friendListObj)
                    .map(() => {
                        return {type: '[main] get friend list useless'};
                    });
        });
    // 同意或拒绝好友请求
    @Effect()
    private isAgreeAddFriend$: Observable<Action> = this.actions$
        .ofType(contactAction.isAgreeAddFriend)
        .map(toPayload)
        .switchMap((message) => {
            let why = '';
            if (message.stateType === 1) {
                why = '拒绝';
            }
            const friendObj = global.JIM.addFriend({
                    target_name: message.name,
                    from_type: 2,
                    why
                }).onSuccess((data) => {
                    if (message.stateType === 1) {
                        this.store$.dispatch({
                            type: contactAction.refuseAddFriendSuccess,
                            payload: message
                        });
                    } else if (message.stateType === 2) {
                        this.store$.dispatch({
                            type: contactAction.agreeAddFriendSuccess,
                            payload: message
                        });
                    }
                }).onFail((error) => {
                    this.store$.dispatch({
                        type: contactAction.addFriendError,
                        payload: message
                    });
                    this.store$.dispatch({
                        type: appAction.errorApiTip,
                        payload: error
                    });
                }).onTimeout(() => {
                    this.store$.dispatch({
                        type: contactAction.addFriendError,
                        payload: message
                    });
                    const error = {code: 910000};
                    this.store$.dispatch({
                        type: appAction.errorApiTip,
                        payload: error
                    });
                });
            return Observable.of(friendObj)
                    .map(() => {
                        return {type: '[main] is agree add friend useless'};
                    });
        });
    // 验证消息查看资料
    @Effect()
    private watchVerifyUser$: Observable<Action> = this.actions$
        .ofType(contactAction.watchVerifyUser)
        .map(toPayload)
        .switchMap((info) => {
            const watchVerifyUser = global.JIM.getUserInfo({username: info.name})
            .onSuccess((data) => {
                let infoType = '';
                if (info.stateType === 4 || info.stateType === 5) {
                    infoType = 'watchOtherInfo';
                } else {
                    infoType = 'verifyUser';
                }
                let user = data.user_info;
                let item = {
                    avatar: user.avatar,
                    key: user.key || user.uid,
                    mtime: user.mtime,
                    name: user.username,
                    nickName: user.nickname,
                    username: user.username,
                    nickname: user.nickname,
                    type: 3,
                    signature: user.signature,
                    gender: user.gender,
                    region: user.region,
                    avatarUrl: '',
                    infoType,
                    eventId: info.eventId,
                    stateType: info.stateType
                };
                if (item.avatar !== '') {
                    global.JIM.getResource({media_id: data.user_info.avatar})
                    .onSuccess((urlInfo) => {
                        item.avatarUrl = urlInfo.url;
                        this.store$.dispatch({
                            type: contactAction.watchVerifyUserSuccess,
                            payload: item
                        });
                    }).onFail((error) => {
                        // pass
                    });
                }
                this.store$.dispatch({
                    type: contactAction.watchVerifyUserSuccess,
                    payload: item
                });
            }).onFail((error) => {
                this.store$.dispatch({
                    type: appAction.errorApiTip,
                    payload: error
                });
            }).onTimeout((data) => {
                const error = {code: 910000};
                this.store$.dispatch({
                    type: appAction.errorApiTip,
                    payload: error
                });
            });
            return Observable.of(watchVerifyUser)
                    .map(() => {
                        return {type: '[main] watch verify user useless'};
                    });
    });
    constructor(
        private actions$: Actions,
        private store$: Store<AppStore>,
        private router: Router
    ) {}
}
