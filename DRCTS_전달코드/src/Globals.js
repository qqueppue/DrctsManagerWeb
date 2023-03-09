const moment = require('moment');

global.userPhone = '';

global.m_listFieldName = ['YES24'];
global.m_strCurrFieldName = '필드';
global.m_nLastFieldIdx = 0;

global.m_listSiteCode = [];
global.m_listSiteName = [];
global.m_strCurrSiteCode = '';
global.m_strCurrSiteName = '사이트';
global.m_nLastSiteIdx = 0;

global.m_listGroupCode = [];
global.m_listGroupName = [];
global.m_strCurrGroupCode = '';
global.m_strCurrGroupName = '그룹';
global.m_nLastGroupIdx = 0;

global.m_listAreaCode = [];
global.m_listAreaName = [];
global.m_strCurrAreaCode = '';
global.m_strCurrAreaName = '구역';
global.m_nLastAreaIdx = 0;

global.m_listSearchResult = ['조회 결과 없음'];
global.m_strCurrSearchResult = '조회 결과 없음';
global.m_nLastResultIdx = 0;

global.m_listDBName = [];
global.m_listBuMode = [];
global.m_listPayMethod = [];

global.m_strCurrDBName = '';

global.m_listTimeUseBoxStart = [];
global.m_listTimeUseBoxEnd = [];

global.m_nLastBoxNo = 0;

global.m_listBoxUseState = [];

global.m_nBoxMin = 1;
global.m_nBoxSum = 0;
global.m_nUsedSum = 0;

global.m_nCol = 0;
global.m_nMasterBoxCol = 0;
global.m_nMasterBoxUpNo = 0;
global.m_nMasterBoxHeight = 0;
global.m_nLastCntMasterBoxCol = 0;
global.m_listBoxHeight =[];
global.m_listBoxWidth =[];
global.m_nBoxDrawType = 0;

global.m_nLastNewAreaIdx = 0;
global.m_strCurrNewAreaCode = '';
global.m_strCurrNewAreaName = '구역';
global.m_strCurrNewDBName = '';

global.ctlSearchData = [];
global.ctlNodeId = -1;

global.accAllArea = false;
global.accPayco = false;
global.accSearchData = [];
global.accTotal = 0;
global.accNodeId = -1;
global.accStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
global.accEndTime = moment().format('YYYY-MM-DD HH:mm:ss');

global.hstAllArea = false;
global.hstSearchData = [];
global.hstNodeId = -1;
global.hstStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
global.hstEndTime = moment().format('YYYY-MM-DD HH:mm:ss');

global.ltermAllArea = false;
global.ltermSearchData = [];
global.ltermNodeId = -1;

global.m_listRsvs = [];
global.rsvSearchData = [];
global.rsvNodeId = -1;

global.m_listshowBoxNo = [];

global.selectValue = '관리자';