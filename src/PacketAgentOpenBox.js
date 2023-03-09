import * as Constants from './Constants';
import Packet from './Packet';

function AgentOpenBox(pTryNum, pAreaCode, pBoxNo) { 
  var len = 1 + Constants.SIZE_AREA_CODE + Constants.SIZE_BOX_NO;
  var pBody = new Uint8Array(len);
  var offset = 0;
  
  Packet.str2ab( pBody, offset, sprintf( '%01d', pTryNum ) );
  offset += 1;

  Packet.str2ab( pBody, offset, pAreaCode );
  offset += Constants.SIZE_AREA_CODE;

  Packet.str2ab( pBody, offset, sprintf( '%03d', pBoxNo ) );

  var pPacket = Packet.makePacketWithBody( pBody, len, Constants.CODE_CMD_AGENT_OPEN_BOX );

  return Buffer.from( pPacket );
}

export default { AgentOpenBox: AgentOpenBox };
