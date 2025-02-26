import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

export let options = {
    vus: 1, // 1 user looping for 1 minute
    duration: '10s',

    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

const BASE_URL = 'https://piopoi.kro.kr';
const USERNAME = 'test@email.com';
const PASSWORD = 'password';

export default function () {
    //메인페이지 접속
    accessMainPage();

    //로그인
    let token = login();

    let authHeaders = {
        headers: {
            Authorization: `Bearer ` + token
        }
    };

    //회원 정보 조회
    getMemberInfo(authHeaders);

    //즐겨찾기 조회
    getFavorites(authHeaders);
}

function accessMainPage() {
    let response = http.get(`${BASE_URL}`);
    check(response, {
        'access main page successfully': (res) => res.status === 200
    });
}

function login() {
    let payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });
    let params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    let response = http.post(`${BASE_URL}/login/token`, payload, params);
    check(response, {
        'logged in successfully': (resp) => resp.json('accessToken') !== ''
    });
    return response.json('accessToken');
}

function getMemberInfo(token) {
    let authHeaders = {
        headers: {
            Authorization: `Bearer ` + token
        }
    };
    let response = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(response, {'get member info successfully': (obj) => obj.id != 0});
    sleep(1);
}

function getFavorites(token) {
    let params = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ` + token
        }
    }
    let response = http.get(`${BASE_URL}/favorites`, params).json();
    check(response, {
        'get favorites successfully': (obj) => obj.id != 0
    });
}

