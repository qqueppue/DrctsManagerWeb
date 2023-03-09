export const SMSUSER = 'ryu1223';

export const ManagerPhone = '16615820';
export const InfoPeelerSendPhone = '16615820';

export const MangerType = 0;

export const m_listServerInfo = [
	{ BU_ServerIP: '', BU_ServerPort: 0, AGENT_ServerIP: '10.178.148.88', AGENT_ServerPort: 9801, JsonControl: 'N' },
];

export const SIZE_AUTH_CODE =	6;
export const SIZE_AREA_CODE =	11;
export const SIZE_BOX_NO =		3;
export const SIZE_TYPE =	1;
export const SIZE_PHONE =	12;
export const SIZE_WASHREQID =	10;

export const OPEN_TYPE_INPUT =		1;

// 전송 코드
export const CODE_STX = 0xFF;
export const CODE_ENQ = 0x05;
export const CODE_ACK = 0x06;
export const CODE_NAK = 0x15;
export const CODE_ETX = 0xFF;

export const CODE_CMD_AGENT_OPEN_BOX = 0x50;
export const CODE_CMD_OPEN_PHONE = 0x13;

export const USER_STATUS_NORMAL = 0;
export const USER_STATUS_TEMP = 1;
export const USER_STATUS_OUT = 2;

export const SIZE_RESULT_MSG = 128;
export const SIZE_REMARK = 2048;
export const SIZE_HISTORY = 2048;
export const SIZE_PROCESS = 256;

export const LOG_LOGIN = 0;
export const LOG_LOGOUT = 1;
export const LOG_OPEN_BOX	= 2;
export const LOG_OPEN_ALLBOX = 3;
export const LOG_BOX_RETURN = 4;
export const LOG_DB_UPDATE = 5;
export const LOG_SMS_TRANS = 6;
export const LOG_PUSH_TRANS =	7;
export const LOG_BOX_SEARCH	= 8;
export const LOG_ACCOUNT_SEARCH	= 9;
export const LOG_ACCOUNT_PRINT = 10;
export const LOG_HISTORY_SEARCH	= 11;
export const LOG_HISTORY_PRINT = 12;
export const LOG_CALLHISTORY_PRINT = 13;
export const LOG_SMS_RESULT = 30;
export const LOG_HISTORY = 31;
export const LOG_CLEAN_PW_CHANGE = 32;
export const LOG_BADLIST_SEARCH = 41;
export const LOG_BADLIST_PRINT = 42;

export const LOCKER_NEW = 0;
export const LOCKER_OPEN = 1;
export const LOCKER_EXTEND = 2;
export const LOCKER_EXIT = 3;
export const LOCKER_OVEREXIT = 4;
export const LOCKER_DELIVERY = 5;
export const LOCKER_DELIVERY_FAILED = 6;
export const LOCKER_FIND = 7;
export const LOCKER_FIND_BACK = 8;
export const LOCKER_SENDUSER = 9;
export const LOCKER_DELIVERYSEND = 10
export const LOCKER_DELIVERYCOLLECT = 11;
export const LOCKER_SENDUSERFIND = 12;
export const LOCKER_MANAGER_RETURN = 13;
export const LOCKER_MANAGER_DBUPDATE = 14;
export const LOCKER_MANAGER_OPEN = 15;
export const LOCKER_MANAGER_BOXCHANGE = 16; // 관리자 박스 체인지
