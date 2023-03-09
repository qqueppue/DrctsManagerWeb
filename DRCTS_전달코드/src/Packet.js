import * as Constants from './Constants';
import encoding from 'text-encoding';
const decoder = new encoding.TextDecoder('EUC-KR');

function makePacketWithBody( pBody, nLen, nCmd ) {
  var pBytes = new Uint8Array(nLen+7);
  var sum = 0x00;
  var n = 0;
  
  pBytes[n++] = Constants.CODE_STX;
  pBytes[n] = Constants.CODE_ENQ;
  sum ^= pBytes[n++];
  
  pBytes[n] = nCmd;
  sum ^= pBytes[n++];
  
  // len (2bytes)
  pBytes[n] = nLen / 0x0100;
  sum ^= pBytes[n++];
  pBytes[n] = nLen % 0x0100;
  sum ^= pBytes[n++];
  
  if (pBody != null) {
    // body
    for(var i = 0; i < nLen; i++)
    {
      pBytes[n] = pBody[i];
      sum ^= pBytes[n++];
    }
  }
  pBytes[n++] = sum;
  pBytes[n++] = Constants.CODE_ETX;
  
  return pBytes;

}

function str2ab( ab, offset, str ) {
  for ( var i = 0, strLen = str.length; i < strLen; i++ ) {
    ab[ offset + i ] = str.charCodeAt( i );
  }

}

function parsePacket( pSrc, nLen ) {
  if (nLen > 6) {
    var startPos = 0;
    var endPos = 0;
    var len = 0;
    
    var pMsg = new Uint8Array( pSrc );
    for (var i = 0; i < nLen-1; i++) {
      if (pMsg[i] == Constants.CODE_STX) {
        if (pMsg[i+1] == Constants.CODE_ENQ || pMsg[i+1] == Constants.CODE_ACK || pMsg[i+1] == Constants.CODE_NAK) {
          startPos = i;
          break;
        }
      }
    }
    
    if (startPos >= 0 && nLen > startPos+6) {
      len = pMsg[startPos+3] * 0x0100 + pMsg[startPos+4];
      endPos = startPos + len + 6;
  
      if (endPos < nLen && pMsg[endPos] == Constants.CODE_ETX) {
        var sum = 0x00;
        var sumStart = startPos + 1;
        var sumEnd = endPos - 1;
        for (var i = sumStart; i < sumEnd; i++) {
          sum ^= pMsg[i];
        }
        
        if (pMsg[sumEnd] == sum) {
          // m_nBodyLen = len;
          // m_pBody = [pSrc subdataWithRange:NSMakeRange(startPos+5, len)];
          return true;
        }
      }
    }
  }
  return false;
}

function ab2int( ab, offset, nLen) {
  var uint8 = new Uint8Array( ab, offset, nLen );
  return parseInt( decoder.decode( uint8 ) );
}

function ab2str( ab, offset, nLen) {
  var uint8 = new Uint8Array( ab, offset, nLen );
  return decoder.decode( uint8 );
}

export default { makePacketWithBody: makePacketWithBody, str2ab: str2ab, parsePacket: parsePacket, ab2int: ab2int, ab2str: ab2str };
