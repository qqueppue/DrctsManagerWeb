import React from 'react';
import { Route } from 'react-router-dom';

import { Login, Control, History } from './components/index';

import { Button } from '@trendmicro/react-buttons';
import '@trendmicro/react-buttons/dist/react-buttons.css';
import Modal from '@trendmicro/react-modal';
import '@trendmicro/react-modal/dist/react-modal.css';

import './Styles.css';

import Header from './layout/Header';

import { deleteCookie, HistoryLog } from './Utils';

import axios from 'axios';
import FlexView from 'react-flexview';

import * as Constants from './Constants';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			redirect: false,
			dataLoaded: false,
			showModal: false,
			showModalExcept: false,
		};
	}

	changeState() {
	    this.setState({
	        dataLoaded: !this.state.dataLoaded
	    });
	}

	componentWillUnMount() { }

  	componentDidMount() {
		axios.get('/getInfo', {
			params: { }
		})
		.then((response) => {
			if (response.data.result == global.userPhone) {
				global.response.data.result;

			} else {
				this.setState({ showModalExcept: true });
			}
		})
		.catch((err) => { console.log(err); });
  	}
  
  	render() {
		let that = this;

		function setlogout() {
			that.setState({ redirect: true });
		}
	  
		function logout() {
			axios.get('/logout', {
				params: { }
			})
			.then((response) => {
				that.setState({ showModal: true });
			});
		}
    
		if ( this.state.redirect ) {
       		return <Login/>;
		}

    	return (
			<div className='container'>
				{this.state.showModalExcept &&
					<Modal
					size = 'xs' 
					disableOverlay={false}
					// onClose={false}
					>
					<Modal.Header>
					<Modal.Title>로그인 안내</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						잘못된 접근입니다.
					</Modal.Body>
					<Modal.Footer>
					<Button btnStyle="primary" onClick={ () => { this.setState({ redirect: true }); } }>확인</Button>
					</Modal.Footer>
					</Modal>
				}

				{this.state.showModal &&
					<Modal
					size = 'xs' 
					disableOverlay={false}
					// onClose={false}
					>
					<Modal.Header>
					<Modal.Title>로그인 만료 안내</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						세션이 만료되어 자동으로 로그아웃됩니다.
						다시 로그인해주세요.
					</Modal.Body>
					<Modal.Footer>
					<Button btnStyle="primary" onClick={ () => { setlogout(); } }>확인</Button>
					</Modal.Footer>
					</Modal>
				}
        		<Header />
				<FlexView column height={document.getElementsByTagName('body')[0].clientHeight}>
					<FlexView style={{ flex: 5.9}}>
            			<div>
							<Route exact path="/" component={props => <Control logout={logout} />} />
							<Route path="/history" component={props => <History logout={logout} />}/>
						</div>
					</FlexView>
				</FlexView>
			</div>
		)
  	}
}
