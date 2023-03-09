import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const home = require('../img/home.ico');
const favorites = require('../img/favorites.ico');
const setting = require('../img/setting.ico');

const MenuItem = ({active, children, to}) => (
    <NavLink exact to={to} className="menu-item">
        {children}
    </NavLink>
)

const Header = () => {
    return (
        <div>
            <div className="menu">
                <MenuItem to={'/'}><img style={{verticalAlign: 'middle'}} src={home}/>  현재 사용현황/제어</MenuItem>
                <MenuItem to={'/history'}><img style={{verticalAlign: 'middle'}} src={favorites}/>  사용내역 조회</MenuItem>
            </div>
        </div>
    );
};

export default Header;