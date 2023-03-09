import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './components/index';

import ReactEncrypt from 'react-encrypt'

const Root = () => (
	<BrowserRouter>
		<ReactEncrypt
	        encryptKey="wpdlxlqlTl@dlszmflqxm#zl$"
		>
	        <Login/>
		</ReactEncrypt>
	</BrowserRouter>
);

export default Root;