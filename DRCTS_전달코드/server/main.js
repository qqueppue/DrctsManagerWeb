import express from 'express';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import axios from 'axios';

var https = require('https');

const iconv = require('iconv-lite');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;
const devPort = 4001;

var sql = require("mssql");
const net = require('net');

const session = require('express-session');
app.use(session({
    secret: '1qaz@WX3edc',
    saveUninitialized: true,
    resave: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        secure: false,
        // maxAge: 10 * 1000,   // 2시간
        maxAge: 2 * 60 * 60 * 1000,   // 2시간
    },
}));

var dbConfig_user = {
    server: "211.117.60.119",
    database: "SMT_MANAGER",
    user: "SMTUser",
    password: "SMTUserPass",
    port: 1049
};

var dbConfig_drcts = {
    server: "192.168.1.47",
    database: "LOCKER_DRCTS",
    user: "SMTUser",
    password: "SMTUserPass",
    port: 1049
};

var dbConfig = [ dbConfig_drcts ];

if(process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    const config = require('../webpack.dev.config');
    let compiler = webpack(config);
    let devServer = new WebpackDevServer(compiler, config.devServer);
    devServer.listen(devPort, () => {
        console.log('webpack-dev-server is listening on port', devPort);
    });
}

app.disable("x-powered-by");

app.use('/', express.static(__dirname + '/../public'));

// private property
var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

// private method for UTF-8 decoding
function _utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = 0, c1 = 0, c2 = 0, c3 = 0;

    while ( i < utftext.length ) {
        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return string;
}

// public method for decoding
function base64Decode(input) {
    var output = '';
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }

        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }

    output = _utf8_decode(output);
    return output;
}

function decipher( salt ) {
    let textToChars = text => text.split('').map(c => c.charCodeAt(0));
    let saltChars = textToChars(salt);
    let applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}

let myDecipher = decipher('wpdlxlqlTldlszmflqtus');

function decodeParams( data ) {
	var decrypted = myDecipher( JSON.stringify( data ) );
	return JSON.parse( base64Decode( decrypted ) );
}

app.route(['/', '/history']).get(function(req, res) { 
    return res.sendFile(path.join(__dirname, '/../public/index.html')); 
});

app.get('/openBox', function (req, res) {
    var query = decodeParams( req.query );
    var socket = net.createConnection(query.port, query.ip);

    var euckrStr = iconv.encode( query.msg, 'euckr' );
    euckrStr[0] = 0xff;
    euckrStr[euckrStr.length-1] = 0xff;
    console.log( query.ip, query.port, euckrStr );

    socket.on('connect', function(connect) {
        socket.write( euckrStr );
    });

    socket.on('error', function(error) {
        res.json(error);
    });

    socket.on('data', function(data) {
        res.json(data);
    });

    socket.on('close', function(close) { });
});

app.get('/api/getSiteInfoList', function (req, res) {
    if (req.session.user) {
        var query = decodeParams( req.query );
        var conn = new sql.ConnectionPool(dbConfig[query.fieldCode]);
        var queryStm = '';
    
        switch (query.info) {
            case 'getSiteList':
                queryStm = `SELECT SiteCode, SiteName 
                              From tblSiteInfo 
                             ORDER BY SiteName ASC`;
                break;
            
            case 'getGroupList':
                var siteCode = query.siteCode;
                queryStm = `SELECT GroupCode, GroupName 
                              FROM tblGroupInfo 
                             WHERE SiteCode=\'${siteCode}\' 
                             ORDER BY GroupName ASC`;
                break;
            
            case 'getAreaList':
                var siteCode = query.siteCode;
                var groupCode = query.groupCode;
                queryStm = `SELECT * 
                              FROM tblAreaConfig 
                             WHERE SiteCode=\'${siteCode}\' and GroupCode=\'${groupCode}\' 
                             ORDER BY AreaName ASC`;
                break;
            
            case 'getBoxSetInfo':
                var areaCode = query.areaCode;
                if ( query.fieldCode == 0 )
                    queryStm = `SELECT StartBoxNo as boxmin, BoxSet as boxsum, BoxCol, MasterBoxCol, MasterBoxUpNo, MasterBoxHeight, LastCntOnMasterBoxCol 
                                  FROM tblAreaConfig 
                                 WHERE AreaCode=\'${areaCode}\'`;
                else
                    queryStm = `SELECT StartBoxNo as boxmin, BoxSet as boxsum, BoxCol, MasterBoxUpNo, MasterBoxHeight, LastCntOnMasterBoxCol 
                                  FROM tblAreaConfig 
                                 WHERE AreaCode=\'${areaCode}\'`;
                break;
            
            case 'getBoxHeightUseState':
                var areaCode = query.areaCode;
                queryStm = `SELECT useState, BoxHeight, BoxWidth, boxNo, showBoxNo  
                              FROM tblBoxMaster 
                             WHERE areaCode=\'${areaCode}\' 
                             ORDER BY boxNo ASC`;
                break;
    
            case 'getBoxInfo':
                var areaCode = query.areaCode;
                var boxNo = query.boxNo;
                queryStm = `SELECT areaCode, boxNo, useState, deliveryType, serviceType, userCode, userName, userPhone, transCode, transPhone, boxPassword, 
                                   CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime,
                                   barCode, useTimeType, payAmount 
                              FROM tblBoxMaster 
                             WHERE areaCode=\'${areaCode}\' and boxNo=\'${boxNo}\'`;
                break;
    
            case 'getReasonInfo':
                queryStm = `SELECT id, ReasonType, ReasonCode, ReasonName, ReasonNameEng
                              FROM tblReasonInfo`;
                break;
    
            case 'searchReasonInfo_update':
                var reasonId = query.reasonId;
                var reasonCode = query.reasonCode;
                // var reasonName = query.reasonName;
                // var reasonEng = query.reasonEng;
                queryStm = `SELECT id, ReasonType, ReasonCode, ReasonName, ReasonNameEng
                              FROM tblReasonInfo
                             WHERE id <> ${reasonId} and (ReasonCode=\'${reasonCode}\')`;
                // queryStm = `SELECT id, ReasonCode, ReasonName, ReasonNameEng
                //               FROM tblReasonInfo
                //              WHERE id <> ${reasonId} and (ReasonCode=\'${reasonCode}\' or ReasonName=\'${reasonName}\' or ReasonNameEng=\'${reasonEng}\')`;
                break;
    
            case 'searchReasonInfo_insert':
                var reasonId = query.reasonId;
                var reasonCode = query.reasonCode;
                // var reasonName = query.reasonName;
                // var reasonEng = query.reasonEng;
                queryStm = `SELECT id, ReasonType, ReasonCode, ReasonName, ReasonNameEng
                              FROM tblReasonInfo
                             WHERE ReasonCode=\'${reasonCode}\'`;
                // queryStm = `SELECT id, ReasonCode, ReasonName, ReasonNameEng
                //               FROM tblReasonInfo
                //              WHERE ReasonCode=\'${reasonCode}\' or ReasonName=\'${reasonName}\' or ReasonNameEng=\'${reasonEng}\'`;
                break;
    
            case 'getShopPwd': 
                var areaCode = query.areaCode;
                queryStm = `SELECT ShopPwd FROM tblAreaConfig WHERE AreaCode=\'${areaCode}\'`;
                break;
    
            default:
                break;
        }
    
        conn.connect().then(function () {
            var req = new sql.Request(conn);
            req.query(queryStm).then(function (result) {
                conn.close();
                res.json(result.recordset);
            })
            .catch(function (err) {
                conn.close();
                res.json(err);
            });
        })
        .catch(function (err) {
            res.json(err);
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
});

app.get('/searchControl', function (req, res) {
    if (req.session.user) {
        var query = decodeParams( req.query );
        var db = Object.assign( {}, dbConfig[query.fieldCode] );
        
        db.database = query.dbName;
            
        var conn = new sql.ConnectionPool(db);
        var queryStm = '';
        var strSqlLocations = '';
        var sText = query.sText;
        var areaCodeList = query.areaCodeList;
        var searchType = query.searchType;
    
        for ( var nIndex = 0, cnt = areaCodeList.length - 1; nIndex < cnt; nIndex++ )
        {
            strSqlLocations += "areaCode= '";
            strSqlLocations += areaCodeList[nIndex];
            strSqlLocations += "' or ";
        }
        strSqlLocations += "areaCode= '";
        strSqlLocations += areaCodeList[nIndex];
        strSqlLocations += "' ";
    
        switch( searchType ) {
    
            case 0 :
                queryStm = `SELECT areaCode, boxNo, serviceType, deliveryType, userCode, userName, boxPassword, userPhone, transCode,
                                   CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime 
                              FROM tblBoxMaster 
                             WHERE useState=1 and userCode like \'%${sText}%\' and (${strSqlLocations})`;
                      break;
    
            case 1 :
                queryStm = `SELECT areaCode, boxNo, serviceType, deliveryType, userCode, userName, boxPassword, userPhone, transCode,
                                   CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime 
                              FROM tblBoxMaster 
                             WHERE useState=1 and userName like \'%${sText}%\' and (${strSqlLocations})`;
                      break;
    
            // case 2 :
            //     queryStm = `SELECT areaCode, boxNo, serviceType, deliveryType, userCode, userName, boxPassword, userPhone, transCode, 
            //                        CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime 
            //                   FROM tblBoxMaster 
            //                  WHERE useState=1 and boxPassword like \'%${sText}%\' and (${strSqlLocations})`;
            //           break;
    
                  default :
                      break;
                      
        }
    
        conn.connect().then(function () {
            var req = new sql.Request(conn);
            req.query( queryStm ).then(function (result) {
                conn.close();
                res.json(result.recordset);
            })
            .catch(function (err) {
                conn.close();
                res.json(err);
            });
        })
        .catch(function (err) {
            res.json(err);
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
});

app.get('/searchHistory', function (req, res) {
    if (req.session.user) {
        var query = decodeParams( req.query );
        var db = Object.assign( {}, dbConfig[query.fieldCode] );
        
        db.database = query.dbName;
            
        var conn = new sql.ConnectionPool(db);
        var queryStm = '';
        var strSqlLocations = '';
        var searchText = query.searchText;
        var allArea = query.allArea;
        var area = query.area;
        var areaCodeList = query.areaCodeList;
        var searchType = query.searchType;
        var startTime = query.startTime;
        var endTime = query.endTime;
    
        for ( var nIndex = 0, cnt = areaCodeList.length - 1; nIndex < cnt; nIndex++ )
        {
            strSqlLocations += "areaCode= '";
            strSqlLocations += areaCodeList[nIndex];
            strSqlLocations += "' or ";
        }
        strSqlLocations += "areaCode= '";
        strSqlLocations += areaCodeList[nIndex];
        strSqlLocations += "' ";
    
        if( allArea ) {
            if( searchType == 0 ) {
                queryStm = `SELECT eventType, CONVERT( CHAR(19), createDate, 120 ) as createDate, areaCode, boxNo, userPhone, transCode, 
                                   CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime, userCode, userName 
                              FROM tblBoxHistory 
                             WHERE userCode like \'%${searchText}%\' and  createDate >= \'${startTime}\' and createDate <= \'${endTime}\' and (${strSqlLocations}) 
                             ORDER BY createDate DESC`;
            
            } else if( searchType == 1 ) {
                queryStm = `SELECT eventType, CONVERT( CHAR(19), createDate, 120 ) as createDate, areaCode, boxNo, CONVERT( CHAR(19), startTime, 120 ) as startTime, 
                                   CONVERT( CHAR(19), endTime, 120 ) as endTime,userCode, userName, userPhone, transCode 
                              FROM tblBoxHistory 
                             WHERE userName like \'%${searchText}%\' and  createDate >= \'${startTime}\' and createDate <= \'${endTime}\' and (${strSqlLocations}) 
                             ORDER BY createDate DESC`;
            }
            // else
            // {
            //     queryStm = `SELECT eventType, CONVERT( CHAR(19), createDate, 120 ) as createDate, areaCode, boxNo, userPhone, transCode, 
            //                        CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime, userCode, userName 
            //                   FROM tblBoxHistory 
            //                  WHERE boxNo = \'${searchText}\' and  createDate >= \'${startTime}\' and createDate <= \'${endTime}\' and (${strSqlLocations}) 
            //                  ORDER by createDate DESC`;
            // }
        } else {
            if( searchType == 0 ) {
                queryStm = `SELECT eventType, CONVERT( CHAR(19), createDate, 120 ) as createDate, areaCode, boxNo, userPhone, transCode, 
                                   CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime, userCode, userName 
                              FROM tblBoxHistory 
                             WHERE areaCode = \'${area}\' and userCode like \'%${searchText}%\' and createDate >= \'${startTime}\' and createDate <= \'${endTime}\'
                             ORDER BY createDate DESC`;
            
            } else if( searchType == 1 ) {
                queryStm = `SELECT eventType, CONVERT( CHAR(19), createDate, 120 ) as createDate, areaCode, boxNo, userPhone, transCode, 
                                   CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime, userCode, userName 
                              FROM tblBoxHistory 
                             WHERE areaCode = \'${area}\' and userName like \'%${searchText}%\' and createDate >= \'${startTime}\' and createDate <= \'${endTime}\' 
                             ORDER BY createDate DESC`;
            }
            // else
            // {
            //     queryStm = `SELECT eventType, CONVERT( CHAR(19), createDate, 120 ) as createDate, areaCode, boxNo, userPhone, transCode, 
            //                        CONVERT( CHAR(19), startTime, 120 ) as startTime, CONVERT( CHAR(19), endTime, 120 ) as endTime, userCode, userName 
            //                   FROM tblBoxHistory 
            //                  WHERE areaCode = \'${area}\' and boxNo = \'${searchText}\' and  createDate >= \'${startTime}\' and createDate <= \'${endTime}\' 
            //                  ORDER BY createDate DESC`;
            // }
        }
    
        conn.connect().then(function () {
            var req = new sql.Request(conn);
            req.query( queryStm ).then(function (result) {
                conn.close();
                res.json(result.recordset);
            })
            .catch(function (err) {
                conn.close();
                res.json(err);
            });
        })
        .catch(function (err) {
            res.json(err);
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
});

app.get('/changeInfo', function (req, res) {
    if (req.session.user) {
        var query = decodeParams( req.query );
        var db = Object.assign( {}, dbConfig[query.fieldCode] );
        db.database = query.dbName;
        var conn = new sql.ConnectionPool(db);
    
        var queryStm = '';
        var info = query.info;
    
        conn.connect().then(function () {
            var req = new sql.Request(conn);
    
            switch (info) {
                case 'returnBox':
                    var boxNo = query.boxNo;
                    var areaCode = query.areaCode;
                    queryStm = `UPDATE tblBoxMaster 
                                   SET useState=2, serviceType=0, userCode='', userName='', userPhone='', 
                                       dong='', addressNum='', transCode='', transPhone='', barCode='', deliveryType=0,
                                       boxPassword='', paycode='', payAmount=0, useTimeType=0, startTime=GETDATE(), endTime=GETDATE() 
                                 WHERE boxNo=\'${boxNo}\' and areaCode=\'${areaCode}\'`;
                    break;
            
                case 'updateBox':
                    var BoxInfo = query.BoxInfo;
                    var boxNo = query.boxNo;
                    var areaCode = query.areaCode;
                    queryStm = `Update tblBoxMaster 
                                   SET serviceType=${BoxInfo.serviceType}, useState=${BoxInfo.useState}, userCode=\'${BoxInfo.userCode}\', 
                                       userName=\'${BoxInfo.userName}\', transCode='', boxPassword=\'${BoxInfo.boxPassword}\', deliveryType=${BoxInfo.deliveryType}, 
                                       useTimeType=${BoxInfo.useTimeType}, startTime=\'${BoxInfo.startTime}\', endTime=\'${BoxInfo.endTime}\', barCode=\'${BoxInfo.barCode}\' 
                                 WHERE boxNo=\'${boxNo}\' and areaCode=\'${areaCode}\'`;
                    break;
            
                case 'boxHistory':
                    var type = query.type;
                    var boxNo = query.boxNo;
                    var areaCode = query.areaCode;
                    queryStm = `INSERT INTO tblBoxHistory 
                                        (eventType, areaCode, boxNo, serviceType, boxSizeType, useState, userCode, userName, userPhone, 
                                        dong, addressNum, transCode, transPhone, barcode, deliveryType, boxPassword, payCode, payAmount, 
                                        useTimeType, startTime, endTime, createDate) 
                                SELECT ${type}, areaCode, boxNo, serviceType, boxSizeType, useState, userCode, userName, userPhone, 
                                        dong, addressNum, transCode, transPhone, barCode, deliveryType, boxPassword, payCode, payAmount, 
                                        useTimeType, startTime, endTime ,GetDate() 
                                  FROM tblBoxMaster
                                 WHERE boxNo=${boxNo} and areaCode=\'${areaCode}\'`;
                    break;
    
                case 'insertResonInfo':
                    var reasonCode = query.reasonCode;
                    var reasonName = query.reasonName;
                    var reasonEng = query.reasonEng;
                    var selectType = query.selectType;
                    queryStm = `INSERT INTO tblReasonInfo
                                       (ReasonType, ReasonCode, ReasonName, ReasonNameEng)
                                VALUES (\'${selectType}\', \'${reasonCode}\', \'${reasonName}\', \'${reasonEng}\')`;
                    break;
    
                case 'deleteResonInfo':
                    var reasonId = query.reasonId;
                    queryStm = `DELETE FROM tblReasonInfo
                                 WHERE id=${reasonId}`;
                    break;
            
                case 'updateResonInfo':
                    var reasonId = query.reasonId;
                    var reasonCode = query.reasonCode;
                    var reasonName = query.reasonName;
                    var reasonEng = query.reasonEng;
                    var selectType = query.selectType;
                    queryStm = `UPDATE tblReasonInfo
                                   SET ReasonType = \'${selectType}\', ReasonCode=\'${reasonCode}\', ReasonName=\'${reasonName}\', ReasonNameEng=\'${reasonEng}\'
                                 WHERE id=${reasonId}`
                    break;
                    
                case 'changePwd':
                    var pwd = query.pwd;
                    var areaCode = query.areaCode;
                    queryStm = `UPDATE tblAreaConfig
                                   SET ShopPwd=\'${pwd}\'
                                 WHERE AreaCode=\'${areaCode}\'`;
                    break;
            
                default:
                    break;
            }
    
            req.query( queryStm ).then(function (result) {
                conn.close();
                res.json({'result': 'success'});
            })
            .catch(function (err) {
                conn.close();
                res.json(err);
            });
        })
        .catch(function (err) {
            res.json(err);
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
});

app.get('/login', function (req, res) {
    var db = Object.assign( {}, dbConfig_user );
    var conn = new sql.ConnectionPool(db);
    var query = decodeParams( req.query );

    var userID = query.userID;
    var queryStm = `SELECT * FROM UserMaster WHERE UserID=\'${userID}\'`;

    conn.connect().then(function () {
        var req = new sql.Request(conn);
        req.query( queryStm ).then(function (result) {
            conn.close();
            res.json(result.recordset);
        })
        .catch(function (err) {
            conn.close();
            res.json(err);
        });
    })
    .catch(function (err) {
        res.json(err);
    });
});

app.get('/logout', function (req, res) {
    if(req.session.user) {
        req.session.destroy(function(err) {
            if(err) {
                var MErr = setError(err);
                res.json({ 'result' : MErr });
            } else {
                res.json({ 'result' : 'success' });
            }
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
	// res.clearCookie();
});

app.get('/searchList', function (req, res) {
    if (req.session.user) {
        var db = Object.assign( {}, dbConfig_user );
        var conn = new sql.ConnectionPool(db);
        var query = decodeParams( req.query );
        var info = query.info;
        var queryStm = '';
    
        conn.connect().then(function () {
            var req = new sql.Request(conn);
            switch (info) {
                case 'historyLog':
                    var id = query.id;
                    queryStm = `SELECT ResultMsg, Remark FROM HistoryLog WHERE id=${id}`;
                    break;
            
                case 'searchID':
                    var userID = query.userID;
                    queryStm = `SELECT * FROM UserMaster WHERE UserID=\'${userID}\'`;
                    break;
                
                default:
                    break;
            }

            req.query( queryStm ).then(function (result) {
                conn.close();
                res.json(result.recordset);
            })
            .catch(function (err) {
                conn.close();
                res.json(err);
            });
        })
        .catch(function (err) {
            res.json(err);
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
});

app.get('/changeList', function (req, res) {
    if (req.session.user) {
        var db = Object.assign( {}, dbConfig_user );
        var conn = new sql.ConnectionPool(db);
        var query = decodeParams( req.query );
        var info = query.info;
        var queryStm = '';
    
        conn.connect().then(function () {
            var req = new sql.Request(conn);
    
            switch (info) {
                case 'userLog':
                    var editedHistory = query.editedHistory;
                    var processDate = query.processDate;
                    var id = query.id;
                    if ( processDate == null ) {
                        if ( editedProcess != '' )
                            queryStm = `UPDATE UserLog SET History=\'${editedHistory}\', Process=\'${editedProcess}\', ProcessDate=GETDATE() WHERE id=${id}`;
                        else
                            queryStm = `UPDATE UserLog SET History=\'${editedHistory}\', Process=\'${editedProcess}\' WHERE id=${id}`;
                    } else {
                        queryStm = `UPDATE UserLog SET History=\'${editedHistory}\', Process=\'${editedProcess}\' WHERE id=${id}`;
                    }
                    break;
    
                case 'historyLog':
                    var userId = query.userId;
                    var type = query.type;
                    var pMsg = query.pMsg;
                    var areaCode = query.areaCode;
                    var boxNo = query.boxNo;
                    var userPhone = query.userPhone;
                    var pRemark = query.pRemark;
                    queryStm = `INSERT INTO HistoryLog 
                                            (CreateDate, UserID, Type, ResultMsg, AreaCode, BoxNo, UserPhone, Remark) 
                                VALUES (GETDATE(), \'${userId}\', ${type}, \'${pMsg}\', \'${areaCode}\', ${boxNo}, \'${userPhone}\', \'${pRemark}\')`;
                    break;
            
                case 'UpdateAccntPassword':
                    var mgrId = query.mgrId;
                    var mgrPw = query.mgrPw;
                    queryStm = `UPDATE UserMaster SET UserPW=\'${mgrPw}\', UpdateDate=GetDate() WHERE UserID=\'${mgrId}\'`;
                    break;
            
                default:
                    break;
            }
    
            req.query( queryStm ).then(function (result) {
                conn.close();
                res.json({'result': 'success'});
            })
            .catch(function (err) {
                conn.close();
                res.json(err);
            });
        })
        .catch(function (err) {
            res.json(err);
        });

    } else {
        res.json({ 'result' : 'sessionOut' });
    }
});

app.get('/setInfo', function (req, res) {
    var query = decodeParams( req.query );
    var userID = query.userID;

    req.session.user = {
        id: userID,
        authorized: true,
    }
    res.json({ 'result' : 'success' });
});

app.get('/getInfo', function (req, res) {
    if (req.session.user) {
        res.json({ 'result': req.session.user.id });
    } else {
        res.json({ 'result': 'notLogined' });
    }
});

app.get('/getAge', function (req, res) {
    if (req.session.user) {
        res.json({ 'maxAge': req.session.cookie.maxAge });
    } else {
        res.json({ 'maxAge': 0 });
    }
});

const server = app.listen(port, () => {
    console.log('Express listening on port', port);
});
