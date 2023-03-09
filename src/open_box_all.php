<?php
	header("Access-Control-Allow-Origin: *");

	$address = $_POST['ip'];	// 접속할 IP //
	$port = $_POST['port'];	// 접속할 PORT //
	$msg = $_POST['msg'];	//보내고자 하는 전문 //
	$len = $_POST['len'];	//보내고자 하는 전문 길이 //
	
	for ($i = 0, $cnt = count( $msg ); $i < $cnt; $i++ ) {
		$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP); // TCP 통신용 소켓 생성 //

		if ($socket === false) {
			echo socket_strerror(socket_last_error());

		} else {
			$result = socket_connect($socket, $address, $port);	// 소켓 연결 및 $result에 접속값 지정 //

			if ($result === false) {
				echo socket_strerror(socket_last_error($socket));

			} else {
				socket_write($socket, hex2bin( $msg[$i] ), $len);	// 실제로 소켓으로 보내는 명령어 //

				$input = socket_read($socket, 1024);  // 소켓으로 부터 받은 REQUEST 정보를 $input에 지정 //
				
				if ( $input[1] == '' )
					$arList .= $i+1 . ' ';
			}

			socket_close($socket);
		}
	}

	echo $arList;
?> 