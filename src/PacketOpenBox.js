import * as Constants from './Constants';

import Packet from './Packet';

function OpenBox(pAuthCode, pReturn, pAreaCode, pBoxNo, pType, pPhone, pOpenType, pBoxAuth, pUseAd) { 

  var len = Constants.SIZE_AUTH_CODE + 1 + 1 + Constants.SIZE_AREA_CODE + Constants.SIZE_BOX_NO + Constants.SIZE_TYPE + Constants.SIZE_PHONE + 1 + Constants.SIZE_AUTH_CODE + 1;
  var pBody = new Uint8Array(len);
  var offset = 0;
  
  Packet.str2ab( pBody, offset, pAuthCode );
  offset += Constants.SIZE_AUTH_CODE;

  Packet.str2ab( pBody, offset, '3' );
  offset += 1;

  var strReturn = 'N';
  if (pReturn) {
      strReturn = 'Y';
  }
  Packet.str2ab( pBody, offset, strReturn );
  offset += 1;

  Packet.str2ab( pBody, offset, pAreaCode );
  offset += Constants.SIZE_AREA_CODE;

  Packet.str2ab( pBody, offset, sprintf( '%03d', pBoxNo ) );
  offset += Constants.SIZE_BOX_NO;

  Packet.str2ab( pBody, offset, pType );
  offset += Constants.SIZE_TYPE;

  Packet.str2ab( pBody, offset, pPhone );
  offset += Constants.SIZE_PHONE;

  var strOpenType = 'Q';
  if (pOpenType == Constants.OPEN_TYPE_INPUT) {
      strOpenType = 'I';
  }
  Packet.str2ab( pBody, offset, strOpenType );
  offset += 1;

  Packet.str2ab( pBody, offset, pBoxAuth );
  offset += Constants.SIZE_AUTH_CODE;

  var strUseAd = 'N';
  if (pUseAd) {
      strUseAd = 'Y';
  }
  Packet.str2ab( pBody, offset, strUseAd );

  var pPacket = Packet.makePacketWithBody( pBody, len, Constants.CODE_CMD_OPEN_PHONE );

  return Buffer.from( pPacket );

}

export default { OpenBox: OpenBox };
