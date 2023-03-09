import axios from 'axios';
import * as Constants from './Constants';

export function HistoryLog( type, resultMsg, areaCode, boxNo, userPhone, remark ) {
  var dataRemark = '';
  var pMsg = '';
  var pRemark = '';

  dataRemark = remark;
  dataRemark = dataRemark.replace( /\u0060/g, ' ' );
  dataRemark = dataRemark.replace( /\u0027/g, ' ' );
  dataRemark = dataRemark.replace( /\u002c/g, ' ' );

  pMsg = ( resultMsg.length >= Constants.SIZE_RESULT_MSG ) ? resultMsg.substring( 0, Constants.SIZE_RESULT_MSG ) : resultMsg;
  pRemark = ( dataRemark.length >= Constants.SIZE_REMARK ) ? dataRemark.substring( 0, Constants.SIZE_REMARK ) : dataRemark;

  axios.get('/changeList', {
    params: {
      info: 'historyLog',
      userId: global.userPhone,
      type: type,
      pMsg: pMsg,
      areaCode: areaCode,
      boxNo: boxNo,
      userPhone: userPhone,
      pRemark: pRemark

    }
  })
  .then((response) => {
    if ( response.data.result != 'success' ) {
	    
	  }
  })
  .catch((err) => {
    // 파일로 queryStm 을 임시 저장해서 다시 로그인하는 경우 파일을 불러와 DB 갱신한다.
    console.log(err);
  });
}

export function BoxHistory( type, fieldIdx, dbName, areaCode, boxNo, func ) {
  axios.get('/changeInfo', {
    params: {
      info: 'boxHistory',
      fieldCode: fieldIdx,
      dbName: dbName,
      type: type,
      boxNo: boxNo,
      areaCode: areaCode,
    }
  })
  .then((response) => {
    if ( response.data.result == 'success' )
      HistoryLog( Constants.LOG_HISTORY, '보관함 이용 내역 성공', areaCode, boxNo, '', 'queryStm' );
    else
      HistoryLog( Constants.LOG_HISTORY, '[ERROR] 보관함 이용 내역 실패! (DB Write Error)', areaCode, boxNo, '', 'queryStm' );
				
		func();				
  })
  .catch((err) => {
    HistoryLog( Constants.LOG_HISTORY, '[ERROR] 보관함 이용 내역 실패! (DB Open Error)', areaCode, boxNo, '', 'queryStm' );
    func();
    console.log(err);
  });
}

export function setCookie(cookieName, value, exdays){
  var exdate = new Date();
  exdate.setHours(23);
  exdate.setMinutes(59);
  exdate.setSeconds(59);
  exdate.setDate(exdate.getDate() + exdays - 1);

  var cookieValue = escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toGMTString());
  document.cookie = cookieName + "=" + cookieValue;
}

export function deleteCookie(cookieName){
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() - 1);
  document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
}

export function getCookie(cookieName) {
  cookieName = cookieName + '=';
  var cookieData = document.cookie;
  var start = cookieData.indexOf(cookieName);
  var cookieValue = '';

  if(start != -1){
    start += cookieName.length;
    var end = cookieData.indexOf(';', start);
    if(end == -1)end = cookieData.length;
    cookieValue = cookieData.substring(start, end);
  }

  return unescape(cookieValue);
}	
