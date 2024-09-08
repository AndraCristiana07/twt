import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import "../../css/home.css";
import Menu from "../drawer";
import axiosInstance from "../../interceptor/axiosInstance";
import media from '../../assets/media.svg';
import { TweetCard } from "../tweetCard";
import { useNavigate } from "react-router-dom";
import close_icon from '../../assets/add.svg'
import { Tooltip } from "@mui/material"; // TODO replace with X icon
import { Mutex } from 'async-mutex'

export const VideoPlayer = () => {
  //video stream
  const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;
  const seaweedfs = {
    "Path": "",
    "Entries": [
      {
        "FullPath": "/output2-aac.mp4",
        "Mtime": "2024-09-07T17:41:03Z",
        "Crtime": "2024-09-07T17:41:03Z",
        "Mode": 432,
        "Uid": 0,
        "Gid": 0,
        "Mime": "",
        "TtlSec": 0,
        "UserName": "",
        "GroupNames": null,
        "SymlinkTarget": "",
        "Md5": "ZJvXQzh0iHZC6pCnbk0s5A==",
        "FileSize": 158339062,
        "Rdev": 0,
        "Inode": 0,
        "Extended": null,
        "chunks": [
          {
            "file_id": "7,011d57f74e5d",
            "size": 4194304,
            "modified_ts_ns": 1725730863461625086,
            "e_tag": "JCdW0/K2rnPbs2asAeRTrQ==",
            "fid": {
              "volume_id": 7,
              "file_key": 285,
              "cookie": 1475825245
            }
          },
          {
            "file_id": "6,011e681810ea",
            "offset": 4194304,
            "size": 4194304,
            "modified_ts_ns": 1725730863471586600,
            "e_tag": "pZV37EcBY+iSvC6vbK0ifw==",
            "fid": {
              "volume_id": 6,
              "file_key": 286,
              "cookie": 1746407658
            }
          },
          {
            "file_id": "1,011f55b6f70f",
            "offset": 8388608,
            "size": 4194304,
            "modified_ts_ns": 1725730863484770373,
            "e_tag": "bzKDIjxgoYGQK9rbY+rCwQ==",
            "fid": {
              "volume_id": 1,
              "file_key": 287,
              "cookie": 1438054159
            }
          },
          {
            "file_id": "7,0120fc0f6516",
            "offset": 12582912,
            "size": 4194304,
            "modified_ts_ns": 1725730863487777813,
            "e_tag": "A+OuhVOi/CYw/9pOXjbHtA==",
            "fid": {
              "volume_id": 7,
              "file_key": 288,
              "cookie": 4228867350
            }
          },
          {
            "file_id": "5,0121ab82bbba",
            "offset": 16777216,
            "size": 4194304,
            "modified_ts_ns": 1725730863503801325,
            "e_tag": "TQR/FqqvzVeI/Hxprot2Kw==",
            "fid": {
              "volume_id": 5,
              "file_key": 289,
              "cookie": 2877471674
            }
          },
          {
            "file_id": "7,0122ade95dd6",
            "offset": 20971520,
            "size": 4194304,
            "modified_ts_ns": 1725730863514707844,
            "e_tag": "nKSo5rcQ2OrdIQUtJrrhWA==",
            "fid": {
              "volume_id": 7,
              "file_key": 290,
              "cookie": 2917752278
            }
          },
          {
            "file_id": "4,0123d472d2b0",
            "offset": 25165824,
            "size": 4194304,
            "modified_ts_ns": 1725730863528203569,
            "e_tag": "bTsPluoibx/eggTsrJb2RA==",
            "fid": {
              "volume_id": 4,
              "file_key": 291,
              "cookie": 3564294832
            }
          },
          {
            "file_id": "6,0124d65107d0",
            "offset": 29360128,
            "size": 4194304,
            "modified_ts_ns": 1725730863540650653,
            "e_tag": "BlJN5N8X4AFGRNPDMgY4pg==",
            "fid": {
              "volume_id": 6,
              "file_key": 292,
              "cookie": 3595634640
            }
          },
          {
            "file_id": "2,0125ff431b89",
            "offset": 33554432,
            "size": 4194304,
            "modified_ts_ns": 1725730863552355670,
            "e_tag": "lty7sDqlXEw71TXRsFaing==",
            "fid": {
              "volume_id": 2,
              "file_key": 293,
              "cookie": 4282588041
            }
          },
          {
            "file_id": "7,01261c388f3b",
            "offset": 37748736,
            "size": 4194304,
            "modified_ts_ns": 1725730863561344939,
            "e_tag": "siunyYyPoo+5ZjiYcGGV+g==",
            "fid": {
              "volume_id": 7,
              "file_key": 294,
              "cookie": 473468731
            }
          },
          {
            "file_id": "4,0127e32f3114",
            "offset": 41943040,
            "size": 4194304,
            "modified_ts_ns": 1725730863570314972,
            "e_tag": "DCvqVzHr+m3R2xFfW2ghOw==",
            "fid": {
              "volume_id": 4,
              "file_key": 295,
              "cookie": 3811520788
            }
          },
          {
            "file_id": "1,012893d0289c",
            "offset": 46137344,
            "size": 4194304,
            "modified_ts_ns": 1725730863578873272,
            "e_tag": "+ak5Xabgw43D0owD1UyOKA==",
            "fid": {
              "volume_id": 1,
              "file_key": 296,
              "cookie": 2479892636
            }
          },
          {
            "file_id": "7,01290f309e0e",
            "offset": 50331648,
            "size": 4194304,
            "modified_ts_ns": 1725730863590625751,
            "e_tag": "16lfxetSmusagr0hzW4iGg==",
            "fid": {
              "volume_id": 7,
              "file_key": 297,
              "cookie": 254844430
            }
          },
          {
            "file_id": "3,012a6ee44f20",
            "offset": 54525952,
            "size": 4194304,
            "modified_ts_ns": 1725730863598920946,
            "e_tag": "0hXpCOvgoF2R51LKA2quUg==",
            "fid": {
              "volume_id": 3,
              "file_key": 298,
              "cookie": 1860456224
            }
          },
          {
            "file_id": "6,012be70321b5",
            "offset": 58720256,
            "size": 4194304,
            "modified_ts_ns": 1725730863614028507,
            "e_tag": "MMFDn9VgX5gy6LDk6HyTYQ==",
            "fid": {
              "volume_id": 6,
              "file_key": 299,
              "cookie": 3875742133
            }
          },
          {
            "file_id": "1,012ca831bcd8",
            "offset": 62914560,
            "size": 4194304,
            "modified_ts_ns": 1725730863621186141,
            "e_tag": "HtQS01XABNg+O8HUssgHtg==",
            "fid": {
              "volume_id": 1,
              "file_key": 300,
              "cookie": 2821831896
            }
          },
          {
            "file_id": "7,012dd3476548",
            "offset": 67108864,
            "size": 4194304,
            "modified_ts_ns": 1725730863631540692,
            "e_tag": "tJu/4FkntAyHzfhN1fOIjw==",
            "fid": {
              "volume_id": 7,
              "file_key": 301,
              "cookie": 3544671560
            }
          },
          {
            "file_id": "5,012efa261c9f",
            "offset": 71303168,
            "size": 4194304,
            "modified_ts_ns": 1725730863641379592,
            "e_tag": "DLb1JEYSpGN9p30wr9xouA==",
            "fid": {
              "volume_id": 5,
              "file_key": 302,
              "cookie": 4196801695
            }
          },
          {
            "file_id": "7,012f675202b6",
            "offset": 75497472,
            "size": 4194304,
            "modified_ts_ns": 1725730863650245842,
            "e_tag": "47AQ5zAq7Fn3B8G1JIls9g==",
            "fid": {
              "volume_id": 7,
              "file_key": 303,
              "cookie": 1733427894
            }
          },
          {
            "file_id": "6,0130c6b3357e",
            "offset": 79691776,
            "size": 4194304,
            "modified_ts_ns": 1725730863661554471,
            "e_tag": "Nw+ZqA0hVlJ/Rr2etiWUEA==",
            "fid": {
              "volume_id": 6,
              "file_key": 304,
              "cookie": 3333633406
            }
          },
          {
            "file_id": "2,0131cb7237a9",
            "offset": 83886080,
            "size": 4194304,
            "modified_ts_ns": 1725730863669171841,
            "e_tag": "jDqPSWYHJuXM+S2CZhHyOw==",
            "fid": {
              "volume_id": 2,
              "file_key": 305,
              "cookie": 3413260201
            }
          },
          {
            "file_id": "5,0132ba0c8ad5",
            "offset": 88080384,
            "size": 4194304,
            "modified_ts_ns": 1725730863678257021,
            "e_tag": "ygYDZI3hMq9dOdA3HkzrpQ==",
            "fid": {
              "volume_id": 5,
              "file_key": 306,
              "cookie": 3121384149
            }
          },
          {
            "file_id": "4,01333af5a7ac",
            "offset": 92274688,
            "size": 4194304,
            "modified_ts_ns": 1725730863688323160,
            "e_tag": "ftygqmSvSg4IuVMvL54aNw==",
            "fid": {
              "volume_id": 4,
              "file_key": 307,
              "cookie": 989177772
            }
          },
          {
            "file_id": "7,01349279e405",
            "offset": 96468992,
            "size": 4194304,
            "modified_ts_ns": 1725730863697613457,
            "e_tag": "1kDZkBuV8GM633IxZu0c2A==",
            "fid": {
              "volume_id": 7,
              "file_key": 308,
              "cookie": 2457461765
            }
          },
          {
            "file_id": "6,013557e2cfdb",
            "offset": 100663296,
            "size": 4194304,
            "modified_ts_ns": 1725730863706216760,
            "e_tag": "Av5ZpequwaAOxNilRQWe7Q==",
            "fid": {
              "volume_id": 6,
              "file_key": 309,
              "cookie": 1474482139
            }
          },
          {
            "file_id": "4,0136b3231c97",
            "offset": 104857600,
            "size": 4194304,
            "modified_ts_ns": 1725730863715863146,
            "e_tag": "Mxf1UZzyYoWyN0gyENu8Wg==",
            "fid": {
              "volume_id": 4,
              "file_key": 310,
              "cookie": 3005422743
            }
          },
          {
            "file_id": "7,0137eb9f0320",
            "offset": 109051904,
            "size": 4194304,
            "modified_ts_ns": 1725730863724544529,
            "e_tag": "kDf/GDpwK4q7whXdqhkNRg==",
            "fid": {
              "volume_id": 7,
              "file_key": 311,
              "cookie": 3953066784
            }
          },
          {
            "file_id": "3,01387ca7f4be",
            "offset": 113246208,
            "size": 4194304,
            "modified_ts_ns": 1725730863732990143,
            "e_tag": "WiFlLx/hN8PGMKp0iybsAw==",
            "fid": {
              "volume_id": 3,
              "file_key": 312,
              "cookie": 2091381950
            }
          },
          {
            "file_id": "1,01398c5451e0",
            "offset": 117440512,
            "size": 4194304,
            "modified_ts_ns": 1725730863742829122,
            "e_tag": "VjsiyWRKwpAl6hTsUnZVNQ==",
            "fid": {
              "volume_id": 1,
              "file_key": 313,
              "cookie": 2354336224
            }
          },
          {
            "file_id": "2,013a0a947548",
            "offset": 121634816,
            "size": 4194304,
            "modified_ts_ns": 1725730863751106926,
            "e_tag": "91nZrcCnZn2lTfe/lCYpVQ==",
            "fid": {
              "volume_id": 2,
              "file_key": 314,
              "cookie": 177501512
            }
          },
          {
            "file_id": "1,013b0f6e06eb",
            "offset": 125829120,
            "size": 4194304,
            "modified_ts_ns": 1725730863760586327,
            "e_tag": "p0VX3jETvut/mAXNZ52llQ==",
            "fid": {
              "volume_id": 1,
              "file_key": 315,
              "cookie": 258868971
            }
          },
          {
            "file_id": "5,013c3b828a4b",
            "offset": 130023424,
            "size": 4194304,
            "modified_ts_ns": 1725730863769708956,
            "e_tag": "T0kuQEEmIt6f0UJqJyJj/Q==",
            "fid": {
              "volume_id": 5,
              "file_key": 316,
              "cookie": 998410827
            }
          },
          {
            "file_id": "4,013d43410864",
            "offset": 134217728,
            "size": 4194304,
            "modified_ts_ns": 1725730863778189940,
            "e_tag": "L8RwaI1yfQAIEJEAXfyUPw==",
            "fid": {
              "volume_id": 4,
              "file_key": 317,
              "cookie": 1128335460
            }
          },
          {
            "file_id": "5,013ea579f215",
            "offset": 138412032,
            "size": 4194304,
            "modified_ts_ns": 1725730863786948297,
            "e_tag": "rNKTAyNqmtfeL32jcbeiYA==",
            "fid": {
              "volume_id": 5,
              "file_key": 318,
              "cookie": 2776232469
            }
          },
          {
            "file_id": "7,013f70f4d678",
            "offset": 142606336,
            "size": 4194304,
            "modified_ts_ns": 1725730863796570052,
            "e_tag": "7KRWeX8gDtttzC9RGoT33Q==",
            "fid": {
              "volume_id": 7,
              "file_key": 319,
              "cookie": 1895093880
            }
          },
          {
            "file_id": "4,014033fff1dd",
            "offset": 146800640,
            "size": 4194304,
            "modified_ts_ns": 1725730863805528458,
            "e_tag": "i8eUJsF2Dyqu6EG4o47/WQ==",
            "fid": {
              "volume_id": 4,
              "file_key": 320,
              "cookie": 872411613
            }
          },
          {
            "file_id": "6,014165df2128",
            "offset": 150994944,
            "size": 4194304,
            "modified_ts_ns": 1725730863814287687,
            "e_tag": "BXNORv1K/XhHVyUF/fYccw==",
            "fid": {
              "volume_id": 6,
              "file_key": 321,
              "cookie": 1709121832
            }
          },
          {
            "file_id": "2,0142ea76384b",
            "offset": 155189248,
            "size": 3149814,
            "modified_ts_ns": 1725730863816426092,
            "e_tag": "DXzgrs4JCZDOpE8pn7zGJw==",
            "fid": {
              "volume_id": 2,
              "file_key": 322,
              "cookie": 3933616203
            }
          }
        ],
        "HardLinkId": null,
        "HardLinkCounter": 0,
        "Content": null,
        "Remote": null,
        "Quota": 0
      },
      {
        "FullPath": "/output2-no-audio.mp4",
        "Mtime": "2024-09-07T17:30:23Z",
        "Crtime": "2024-09-07T17:30:23Z",
        "Mode": 432,
        "Uid": 0,
        "Gid": 0,
        "Mime": "",
        "TtlSec": 0,
        "UserName": "",
        "GroupNames": null,
        "SymlinkTarget": "",
        "Md5": "1BsxlzB6MQ4F6kTmxiilhg==",
        "FileSize": 148560124,
        "Rdev": 0,
        "Inode": 0,
        "Extended": null,
        "chunks": [
          {
            "file_id": "3,f8bf8db5b2",
            "size": 4194304,
            "modified_ts_ns": 1725730222701578471,
            "e_tag": "uT8DNSXtciam8p02gQ3Hzw==",
            "fid": {
              "volume_id": 3,
              "file_key": 248,
              "cookie": 3213735346
            }
          },
          {
            "file_id": "7,f9cea55820",
            "offset": 4194304,
            "size": 4194304,
            "modified_ts_ns": 1725730222713429602,
            "e_tag": "MLqQ9xCoTY3jdhucYhIfMQ==",
            "fid": {
              "volume_id": 7,
              "file_key": 249,
              "cookie": 3466942496
            }
          },
          {
            "file_id": "6,fa81788dd2",
            "offset": 8388608,
            "size": 4194304,
            "modified_ts_ns": 1725730222720636949,
            "e_tag": "kdD7DOTi39yE/+ODlVbAlA==",
            "fid": {
              "volume_id": 6,
              "file_key": 250,
              "cookie": 2172161490
            }
          },
          {
            "file_id": "1,fbf123a7a7",
            "offset": 12582912,
            "size": 4194304,
            "modified_ts_ns": 1725730222728928373,
            "e_tag": "e9pkm3VPV3RxKpuUfkxuAg==",
            "fid": {
              "volume_id": 1,
              "file_key": 251,
              "cookie": 4045645735
            }
          },
          {
            "file_id": "4,fc37d8360b",
            "offset": 16777216,
            "size": 4194304,
            "modified_ts_ns": 1725730222750161348,
            "e_tag": "eEU4J8PulUbQtwBH8FJIcw==",
            "fid": {
              "volume_id": 4,
              "file_key": 252,
              "cookie": 936916491
            }
          },
          {
            "file_id": "5,fddf02fa9e",
            "offset": 20971520,
            "size": 4194304,
            "modified_ts_ns": 1725730222753766058,
            "e_tag": "Fi4L8abgfZyWS1fYC5jAmg==",
            "fid": {
              "volume_id": 5,
              "file_key": 253,
              "cookie": 3741514398
            }
          },
          {
            "file_id": "2,fef5d3c155",
            "offset": 25165824,
            "size": 4194304,
            "modified_ts_ns": 1725730222767378480,
            "e_tag": "P8t64hYTE+UdMRCADb4ZnA==",
            "fid": {
              "volume_id": 2,
              "file_key": 254,
              "cookie": 4124295509
            }
          },
          {
            "file_id": "1,ffdc8dca97",
            "offset": 29360128,
            "size": 4194304,
            "modified_ts_ns": 1725730222776480653,
            "e_tag": "F06Se9FO1/hSJ30gMZU7mA==",
            "fid": {
              "volume_id": 1,
              "file_key": 255,
              "cookie": 3700279959
            }
          },
          {
            "file_id": "6,0100b56595d8",
            "offset": 33554432,
            "size": 4194304,
            "modified_ts_ns": 1725730222788401360,
            "e_tag": "DBYD5vVna55DhAXuxE9HSw==",
            "fid": {
              "volume_id": 6,
              "file_key": 256,
              "cookie": 3043333592
            }
          },
          {
            "file_id": "2,01011ab68f7e",
            "offset": 37748736,
            "size": 4194304,
            "modified_ts_ns": 1725730222795554518,
            "e_tag": "2UGHmL6hAWKSlf6SRXV7DQ==",
            "fid": {
              "volume_id": 2,
              "file_key": 257,
              "cookie": 448171902
            }
          },
          {
            "file_id": "1,0102ae445371",
            "offset": 41943040,
            "size": 4194304,
            "modified_ts_ns": 1725730222807917486,
            "e_tag": "lS9j4XgTCvauD06t/3a+nA==",
            "fid": {
              "volume_id": 1,
              "file_key": 258,
              "cookie": 2923713393
            }
          },
          {
            "file_id": "3,0103df3e4fd0",
            "offset": 46137344,
            "size": 4194304,
            "modified_ts_ns": 1725730222823226700,
            "e_tag": "fWGNTdEScLRwuzHSU/TxHQ==",
            "fid": {
              "volume_id": 3,
              "file_key": 259,
              "cookie": 3745402832
            }
          },
          {
            "file_id": "5,01049fbd55a4",
            "offset": 50331648,
            "size": 4194304,
            "modified_ts_ns": 1725730222831744624,
            "e_tag": "SqI0pzVGkbfdGleU1hYE0A==",
            "fid": {
              "volume_id": 5,
              "file_key": 260,
              "cookie": 2679985572
            }
          },
          {
            "file_id": "5,0105d30ca7f5",
            "offset": 54525952,
            "size": 4194304,
            "modified_ts_ns": 1725730222843380219,
            "e_tag": "MdlA9JGMWk7DcovW6DOT5w==",
            "fid": {
              "volume_id": 5,
              "file_key": 261,
              "cookie": 3540822005
            }
          },
          {
            "file_id": "6,0106c04598f0",
            "offset": 58720256,
            "size": 4194304,
            "modified_ts_ns": 1725730222862758804,
            "e_tag": "9fTMq6qyeiqVMlJCZh8SVg==",
            "fid": {
              "volume_id": 6,
              "file_key": 262,
              "cookie": 3225786608
            }
          },
          {
            "file_id": "5,010780fa580f",
            "offset": 62914560,
            "size": 4194304,
            "modified_ts_ns": 1725730222868244965,
            "e_tag": "b+xDSimWo1JA2/ozCS7XUA==",
            "fid": {
              "volume_id": 5,
              "file_key": 263,
              "cookie": 2163890191
            }
          },
          {
            "file_id": "7,010820f90ba0",
            "offset": 67108864,
            "size": 4194304,
            "modified_ts_ns": 1725730222874988305,
            "e_tag": "LZtlH1iT3x8+Oy1UPrittg==",
            "fid": {
              "volume_id": 7,
              "file_key": 264,
              "cookie": 553192352
            }
          },
          {
            "file_id": "5,0109458950af",
            "offset": 71303168,
            "size": 4194304,
            "modified_ts_ns": 1725730222881556526,
            "e_tag": "fUiRINe/ZZGCr3+/4SRI2g==",
            "fid": {
              "volume_id": 5,
              "file_key": 265,
              "cookie": 1166626991
            }
          },
          {
            "file_id": "2,010a7781dfa1",
            "offset": 75497472,
            "size": 4194304,
            "modified_ts_ns": 1725730222889148841,
            "e_tag": "w+U/B63M0yR9YzGw/pktkQ==",
            "fid": {
              "volume_id": 2,
              "file_key": 266,
              "cookie": 2005000097
            }
          },
          {
            "file_id": "2,010bd5ecfc99",
            "offset": 79691776,
            "size": 4194304,
            "modified_ts_ns": 1725730222899652297,
            "e_tag": "p7FJOOuLWyi2JQ50Z3Uk8Q==",
            "fid": {
              "volume_id": 2,
              "file_key": 267,
              "cookie": 3589078169
            }
          },
          {
            "file_id": "5,010c7fcd7485",
            "offset": 83886080,
            "size": 4194304,
            "modified_ts_ns": 1725730222908702110,
            "e_tag": "+K0YYlSZfxSqJ5j08bcgmg==",
            "fid": {
              "volume_id": 5,
              "file_key": 268,
              "cookie": 2144171141
            }
          },
          {
            "file_id": "4,010d5bab78ff",
            "offset": 88080384,
            "size": 4194304,
            "modified_ts_ns": 1725730222918392221,
            "e_tag": "wemfV8t6C4s5BpmsJXi92w==",
            "fid": {
              "volume_id": 4,
              "file_key": 269,
              "cookie": 1537964287
            }
          },
          {
            "file_id": "4,010ea571cda7",
            "offset": 92274688,
            "size": 4194304,
            "modified_ts_ns": 1725730222928745508,
            "e_tag": "r1a0jZcroy9NkS2UfmWG8A==",
            "fid": {
              "volume_id": 4,
              "file_key": 270,
              "cookie": 2775698855
            }
          },
          {
            "file_id": "5,010f23336c6e",
            "offset": 96468992,
            "size": 4194304,
            "modified_ts_ns": 1725730222937017789,
            "e_tag": "Ins0GrgGpTfmXe7Z6cIUVw==",
            "fid": {
              "volume_id": 5,
              "file_key": 271,
              "cookie": 590572654
            }
          },
          {
            "file_id": "5,011011369705",
            "offset": 100663296,
            "size": 4194304,
            "modified_ts_ns": 1725730222945840264,
            "e_tag": "2unGGhtjYRq+0wGXWXpKaQ==",
            "fid": {
              "volume_id": 5,
              "file_key": 272,
              "cookie": 288790277
            }
          },
          {
            "file_id": "1,0111fecaeeff",
            "offset": 104857600,
            "size": 4194304,
            "modified_ts_ns": 1725730222955244312,
            "e_tag": "v/wkY+gTQoq3Ds747ho3aw==",
            "fid": {
              "volume_id": 1,
              "file_key": 273,
              "cookie": 4274712319
            }
          },
          {
            "file_id": "7,0112113912a9",
            "offset": 109051904,
            "size": 4194304,
            "modified_ts_ns": 1725730222964834865,
            "e_tag": "mboN7Luvn57REzw6r10ysg==",
            "fid": {
              "volume_id": 7,
              "file_key": 274,
              "cookie": 288953001
            }
          },
          {
            "file_id": "5,01136147505c",
            "offset": 113246208,
            "size": 4194304,
            "modified_ts_ns": 1725730222973272504,
            "e_tag": "7/LlCtSsPlSCzvZv97wVgw==",
            "fid": {
              "volume_id": 5,
              "file_key": 275,
              "cookie": 1632063580
            }
          },
          {
            "file_id": "1,0114708cbc06",
            "offset": 117440512,
            "size": 4194304,
            "modified_ts_ns": 1725730222981680840,
            "e_tag": "c1jk93iJoouzd+mfbO6dTg==",
            "fid": {
              "volume_id": 1,
              "file_key": 276,
              "cookie": 1888271366
            }
          },
          {
            "file_id": "7,01155ac54a57",
            "offset": 121634816,
            "size": 4194304,
            "modified_ts_ns": 1725730222990403847,
            "e_tag": "DPflXYGu+da3qaYPAeJXbg==",
            "fid": {
              "volume_id": 7,
              "file_key": 277,
              "cookie": 1522879063
            }
          },
          {
            "file_id": "2,01164241bfd4",
            "offset": 125829120,
            "size": 4194304,
            "modified_ts_ns": 1725730222999240158,
            "e_tag": "eHoiCTiHFlaqNjZMonn3dQ==",
            "fid": {
              "volume_id": 2,
              "file_key": 278,
              "cookie": 1111605204
            }
          },
          {
            "file_id": "6,0117953d7240",
            "offset": 130023424,
            "size": 4194304,
            "modified_ts_ns": 1725730223008865185,
            "e_tag": "ZpCxxJ3OivoyUnGJ2Rw/2w==",
            "fid": {
              "volume_id": 6,
              "file_key": 279,
              "cookie": 2503832128
            }
          },
          {
            "file_id": "2,011898711644",
            "offset": 134217728,
            "size": 4194304,
            "modified_ts_ns": 1725730223018642281,
            "e_tag": "iRsKnpAd8njh1Pf+NFUr2w==",
            "fid": {
              "volume_id": 2,
              "file_key": 280,
              "cookie": 2557548100
            }
          },
          {
            "file_id": "2,01192c054e66",
            "offset": 138412032,
            "size": 4194304,
            "modified_ts_ns": 1725730223027755882,
            "e_tag": "Zj2o1KSDkKbK55nJrf5shA==",
            "fid": {
              "volume_id": 2,
              "file_key": 281,
              "cookie": 738545254
            }
          },
          {
            "file_id": "3,011a3e29d685",
            "offset": 142606336,
            "size": 4194304,
            "modified_ts_ns": 1725730223035313279,
            "e_tag": "6yPfUBvaJneAQXF2xSjQrw==",
            "fid": {
              "volume_id": 3,
              "file_key": 282,
              "cookie": 1042929285
            }
          },
          {
            "file_id": "5,011b95065ebd",
            "offset": 146800640,
            "size": 1759484,
            "modified_ts_ns": 1725730223031384060,
            "e_tag": "SYvVYrDk+rVGj+w4/d+OzA==",
            "fid": {
              "volume_id": 5,
              "file_key": 283,
              "cookie": 2500222653
            }
          }
        ],
        "HardLinkId": null,
        "HardLinkCounter": 0,
        "Content": null,
        "Remote": null,
        "Quota": 0
      },
      {
        "FullPath": "/output2-no-base_data_offset.mp4",
        "Mtime": "2024-09-07T19:53:48Z",
        "Crtime": "2024-09-07T19:53:48Z",
        "Mode": 432,
        "Uid": 0,
        "Gid": 0,
        "Mime": "",
        "TtlSec": 0,
        "UserName": "",
        "GroupNames": null,
        "SymlinkTarget": "",
        "Md5": "MmruHFIF/njUHTevuRcXKw==",
        "FileSize": 158334798,
        "Rdev": 0,
        "Inode": 0,
        "Extended": null,
        "chunks": [
          {
            "file_id": "3,014445271cf2",
            "size": 4194304,
            "modified_ts_ns": 1725738827718143660,
            "e_tag": "+uKuZNdy1AfCv1IZs9UJeA==",
            "fid": {
              "volume_id": 3,
              "file_key": 324,
              "cookie": 1160191218
            }
          },
          {
            "file_id": "7,0145aaf38852",
            "offset": 4194304,
            "size": 4194304,
            "modified_ts_ns": 1725738827733216902,
            "e_tag": "AGAwkwfigxerfTlcoNc6JQ==",
            "fid": {
              "volume_id": 7,
              "file_key": 325,
              "cookie": 2868086866
            }
          },
          {
            "file_id": "1,0146b088b688",
            "offset": 8388608,
            "size": 4194304,
            "modified_ts_ns": 1725738827744677458,
            "e_tag": "L9/c0Bn5eR5xYVRC4BVx1Q==",
            "fid": {
              "volume_id": 1,
              "file_key": 326,
              "cookie": 2961749640
            }
          },
          {
            "file_id": "2,01475492e136",
            "offset": 12582912,
            "size": 4194304,
            "modified_ts_ns": 1725738827760842931,
            "e_tag": "VIT8tjDMKIJPQtOBiu3FVw==",
            "fid": {
              "volume_id": 2,
              "file_key": 327,
              "cookie": 1418912054
            }
          },
          {
            "file_id": "7,0148a7f16cca",
            "offset": 16777216,
            "size": 4194304,
            "modified_ts_ns": 1725738827772126233,
            "e_tag": "elrrJvGshTTqRNDD3HCFoQ==",
            "fid": {
              "volume_id": 7,
              "file_key": 328,
              "cookie": 2817617098
            }
          },
          {
            "file_id": "7,01498b10a4f5",
            "offset": 20971520,
            "size": 4194304,
            "modified_ts_ns": 1725738827780608148,
            "e_tag": "RcH73ciptWO9skvw30aWvw==",
            "fid": {
              "volume_id": 7,
              "file_key": 329,
              "cookie": 2333123829
            }
          },
          {
            "file_id": "6,014ad0dfb981",
            "offset": 25165824,
            "size": 4194304,
            "modified_ts_ns": 1725738827792597640,
            "e_tag": "3FKloKWRM5qy7f6sHXn2hg==",
            "fid": {
              "volume_id": 6,
              "file_key": 330,
              "cookie": 3504322945
            }
          },
          {
            "file_id": "6,014bf1bce270",
            "offset": 29360128,
            "size": 4194304,
            "modified_ts_ns": 1725738827808277085,
            "e_tag": "MFy6VfdbHoB2zi8RaiVoyw==",
            "fid": {
              "volume_id": 6,
              "file_key": 331,
              "cookie": 4055687792
            }
          },
          {
            "file_id": "6,014c0a0fad80",
            "offset": 33554432,
            "size": 4194304,
            "modified_ts_ns": 1725738827817923711,
            "e_tag": "0YDvJNUzKKmbygBa3p3xGQ==",
            "fid": {
              "volume_id": 6,
              "file_key": 332,
              "cookie": 168799616
            }
          },
          {
            "file_id": "7,014d2454de98",
            "offset": 37748736,
            "size": 4194304,
            "modified_ts_ns": 1725738827826864209,
            "e_tag": "qp6vsCeQxkmkCYxVJA5RSg==",
            "fid": {
              "volume_id": 7,
              "file_key": 333,
              "cookie": 609541784
            }
          },
          {
            "file_id": "3,014e8777d162",
            "offset": 41943040,
            "size": 4194304,
            "modified_ts_ns": 1725738827839747627,
            "e_tag": "6YardphrJUIMQ+HuQdAieg==",
            "fid": {
              "volume_id": 3,
              "file_key": 334,
              "cookie": 2272776546
            }
          },
          {
            "file_id": "2,014fc4f41ae6",
            "offset": 46137344,
            "size": 4194304,
            "modified_ts_ns": 1725738827848391437,
            "e_tag": "qmaLed/QvU7tEfajsM/c7Q==",
            "fid": {
              "volume_id": 2,
              "file_key": 335,
              "cookie": 3304332006
            }
          },
          {
            "file_id": "1,015059af0034",
            "offset": 50331648,
            "size": 4194304,
            "modified_ts_ns": 1725738827857373799,
            "e_tag": "wy6//6akrLpPHFZkc2E+GQ==",
            "fid": {
              "volume_id": 1,
              "file_key": 336,
              "cookie": 1504641076
            }
          },
          {
            "file_id": "2,015155d0c2b3",
            "offset": 54525952,
            "size": 4194304,
            "modified_ts_ns": 1725738827865177708,
            "e_tag": "Ry7PaRfu+z6prIVcPNmzvQ==",
            "fid": {
              "volume_id": 2,
              "file_key": 337,
              "cookie": 1439744691
            }
          },
          {
            "file_id": "7,015272ab5b06",
            "offset": 58720256,
            "size": 4194304,
            "modified_ts_ns": 1725738827874446800,
            "e_tag": "UsiX7gNbcTE32yyZN/wYKg==",
            "fid": {
              "volume_id": 7,
              "file_key": 338,
              "cookie": 1923832582
            }
          },
          {
            "file_id": "1,015349dad4ae",
            "offset": 62914560,
            "size": 4194304,
            "modified_ts_ns": 1725738827883987910,
            "e_tag": "2RkjOFlTNl7ohK1XVNcB1Q==",
            "fid": {
              "volume_id": 1,
              "file_key": 339,
              "cookie": 1239078062
            }
          },
          {
            "file_id": "3,01549c63ef83",
            "offset": 67108864,
            "size": 4194304,
            "modified_ts_ns": 1725738827892505722,
            "e_tag": "RdQym356YVdMFapg5bS6fQ==",
            "fid": {
              "volume_id": 3,
              "file_key": 340,
              "cookie": 2623795075
            }
          },
          {
            "file_id": "5,0155c95f62d8",
            "offset": 71303168,
            "size": 4194304,
            "modified_ts_ns": 1725738827900449911,
            "e_tag": "tmAL7W2RvmPUIStomPqBrQ==",
            "fid": {
              "volume_id": 5,
              "file_key": 341,
              "cookie": 3378471640
            }
          },
          {
            "file_id": "5,0156b55d72c2",
            "offset": 75497472,
            "size": 4194304,
            "modified_ts_ns": 1725738827908788647,
            "e_tag": "VS3P0XemeM2rF/Rbx8ckVg==",
            "fid": {
              "volume_id": 5,
              "file_key": 342,
              "cookie": 3042800322
            }
          },
          {
            "file_id": "1,01579c21b33f",
            "offset": 79691776,
            "size": 4194304,
            "modified_ts_ns": 1725738827916231321,
            "e_tag": "tpl3kPI65xogGGwyWx329A==",
            "fid": {
              "volume_id": 1,
              "file_key": 343,
              "cookie": 2619454271
            }
          },
          {
            "file_id": "4,015848590546",
            "offset": 83886080,
            "size": 4194304,
            "modified_ts_ns": 1725738827925611131,
            "e_tag": "Q9YRWJND75Efyx7V7GIvWA==",
            "fid": {
              "volume_id": 4,
              "file_key": 344,
              "cookie": 1213793606
            }
          },
          {
            "file_id": "4,0159c912e9e2",
            "offset": 88080384,
            "size": 4194304,
            "modified_ts_ns": 1725738827935051796,
            "e_tag": "xzs9yDVfntpnxY4QzwA/GQ==",
            "fid": {
              "volume_id": 4,
              "file_key": 345,
              "cookie": 3373459938
            }
          },
          {
            "file_id": "3,015a330fe820",
            "offset": 92274688,
            "size": 4194304,
            "modified_ts_ns": 1725738827945215932,
            "e_tag": "FCLywbFeXLsvcFeGbI0MiA==",
            "fid": {
              "volume_id": 3,
              "file_key": 346,
              "cookie": 856680480
            }
          },
          {
            "file_id": "7,015b325f82cd",
            "offset": 96468992,
            "size": 4194304,
            "modified_ts_ns": 1725738827954286720,
            "e_tag": "aY+wZuQnnz6dw5WHYYUf0A==",
            "fid": {
              "volume_id": 7,
              "file_key": 347,
              "cookie": 845120205
            }
          },
          {
            "file_id": "1,015cead4d59f",
            "offset": 100663296,
            "size": 4194304,
            "modified_ts_ns": 1725738827962757866,
            "e_tag": "WAuzmJ9TZy4AzxmJeizdBg==",
            "fid": {
              "volume_id": 1,
              "file_key": 348,
              "cookie": 3939816863
            }
          },
          {
            "file_id": "2,015d576043f5",
            "offset": 104857600,
            "size": 4194304,
            "modified_ts_ns": 1725738827971383684,
            "e_tag": "txJwTbn39MnBpuVokOaGgA==",
            "fid": {
              "volume_id": 2,
              "file_key": 349,
              "cookie": 1465926645
            }
          },
          {
            "file_id": "3,015e87ed99ad",
            "offset": 109051904,
            "size": 4194304,
            "modified_ts_ns": 1725738827980775542,
            "e_tag": "v+A2V/YlrjZlZQ3CUM6Lmw==",
            "fid": {
              "volume_id": 3,
              "file_key": 350,
              "cookie": 2280495533
            }
          },
          {
            "file_id": "2,015f40e7a82f",
            "offset": 113246208,
            "size": 4194304,
            "modified_ts_ns": 1725738827990631247,
            "e_tag": "D4a+UJPJEOgjnmtxHBbOPA==",
            "fid": {
              "volume_id": 2,
              "file_key": 351,
              "cookie": 1088923695
            }
          },
          {
            "file_id": "2,0160a13c7960",
            "offset": 117440512,
            "size": 4194304,
            "modified_ts_ns": 1725738827999736114,
            "e_tag": "o3o1R6V7feuOy5ANdW6iWg==",
            "fid": {
              "volume_id": 2,
              "file_key": 352,
              "cookie": 2705095008
            }
          },
          {
            "file_id": "7,01613a148564",
            "offset": 121634816,
            "size": 4194304,
            "modified_ts_ns": 1725738828010049603,
            "e_tag": "umMDC2QBAx5bAelHAohV+Q==",
            "fid": {
              "volume_id": 7,
              "file_key": 353,
              "cookie": 974423396
            }
          },
          {
            "file_id": "1,01620f242281",
            "offset": 125829120,
            "size": 4194304,
            "modified_ts_ns": 1725738828017586200,
            "e_tag": "E60TROXuueKiDzCpFqWudA==",
            "fid": {
              "volume_id": 1,
              "file_key": 354,
              "cookie": 254026369
            }
          },
          {
            "file_id": "3,01638453c467",
            "offset": 130023424,
            "size": 4194304,
            "modified_ts_ns": 1725738828026935120,
            "e_tag": "QK93WxbkzTUUuwgKjgItZg==",
            "fid": {
              "volume_id": 3,
              "file_key": 355,
              "cookie": 2220082279
            }
          },
          {
            "file_id": "4,0164e62f7bff",
            "offset": 134217728,
            "size": 4194304,
            "modified_ts_ns": 1725738828035684169,
            "e_tag": "T1gnDJNbCsSoLtq+T5T3Lg==",
            "fid": {
              "volume_id": 4,
              "file_key": 356,
              "cookie": 3861871615
            }
          },
          {
            "file_id": "2,01656eef16e4",
            "offset": 138412032,
            "size": 4194304,
            "modified_ts_ns": 1725738828045379952,
            "e_tag": "J+vbeqcBswdgBJLSAYQKXA==",
            "fid": {
              "volume_id": 2,
              "file_key": 357,
              "cookie": 1861162724
            }
          },
          {
            "file_id": "7,0166771b176c",
            "offset": 142606336,
            "size": 4194304,
            "modified_ts_ns": 1725738828054526663,
            "e_tag": "y0jJEDyfjP96Zhimf0ZIOA==",
            "fid": {
              "volume_id": 7,
              "file_key": 358,
              "cookie": 1998264172
            }
          },
          {
            "file_id": "7,0167db538930",
            "offset": 146800640,
            "size": 4194304,
            "modified_ts_ns": 1725738828063431872,
            "e_tag": "iNwUkDb0SipO30eU7VnLog==",
            "fid": {
              "volume_id": 7,
              "file_key": 359,
              "cookie": 3679684912
            }
          },
          {
            "file_id": "7,0168cfb41d50",
            "offset": 150994944,
            "size": 4194304,
            "modified_ts_ns": 1725738828071247859,
            "e_tag": "DYsc5jwTYm2HA6nz5beZNg==",
            "fid": {
              "volume_id": 7,
              "file_key": 360,
              "cookie": 3484687696
            }
          },
          {
            "file_id": "4,0169abf8965d",
            "offset": 155189248,
            "size": 3145550,
            "modified_ts_ns": 1725738828073160198,
            "e_tag": "E8fWpPmVAnth9/LUnghusw==",
            "fid": {
              "volume_id": 4,
              "file_key": 361,
              "cookie": 2885195357
            }
          }
        ],
        "HardLinkId": null,
        "HardLinkCounter": 0,
        "Content": null,
        "Remote": null,
        "Quota": 0
      },
      {
        "FullPath": "/output2.mp4",
        "Mtime": "2024-09-07T17:23:04Z",
        "Crtime": "2024-09-07T17:23:04Z",
        "Mode": 432,
        "Uid": 0,
        "Gid": 0,
        "Mime": "",
        "TtlSec": 0,
        "UserName": "",
        "GroupNames": null,
        "SymlinkTarget": "",
        "Md5": "gCXn1JM9GB1BOeaFNNcf+Q==",
        "FileSize": 158223773,
        "Rdev": 0,
        "Inode": 0,
        "Extended": null,
        "chunks": [
          {
            "file_id": "4,d1165c2f5b",
            "size": 4194304,
            "modified_ts_ns": 1725729783959724088,
            "e_tag": "pTvUFZDzs5fqqy6sTFRjLg==",
            "fid": {
              "volume_id": 4,
              "file_key": 209,
              "cookie": 375140187
            }
          },
          {
            "file_id": "2,d2f1debce3",
            "offset": 4194304,
            "size": 4194304,
            "modified_ts_ns": 1725729783968071859,
            "e_tag": "+CkmN525ScPc+gOwIW/ZrA==",
            "fid": {
              "volume_id": 2,
              "file_key": 210,
              "cookie": 4057906403
            }
          },
          {
            "file_id": "5,d3be2c6f36",
            "offset": 8388608,
            "size": 4194304,
            "modified_ts_ns": 1725729783982078533,
            "e_tag": "EJqBQaBSPcnlCUoWoykk9g==",
            "fid": {
              "volume_id": 5,
              "file_key": 211,
              "cookie": 3190583094
            }
          },
          {
            "file_id": "5,d430d74f9a",
            "offset": 12582912,
            "size": 4194304,
            "modified_ts_ns": 1725729783992025372,
            "e_tag": "wDo9Dt4jewYtGOulzKFWug==",
            "fid": {
              "volume_id": 5,
              "file_key": 212,
              "cookie": 819416986
            }
          },
          {
            "file_id": "6,d508ef20b0",
            "offset": 16777216,
            "size": 4194304,
            "modified_ts_ns": 1725729783999898082,
            "e_tag": "DN/nGiR2PboVfhOAQ7Uvfw==",
            "fid": {
              "volume_id": 6,
              "file_key": 213,
              "cookie": 149889200
            }
          },
          {
            "file_id": "2,d6d2dfca1d",
            "offset": 20971520,
            "size": 4194304,
            "modified_ts_ns": 1725729784013955524,
            "e_tag": "YSAKiFlOxxQ+KMldFNA+6Q==",
            "fid": {
              "volume_id": 2,
              "file_key": 214,
              "cookie": 3537881629
            }
          },
          {
            "file_id": "5,d7c5343f68",
            "offset": 25165824,
            "size": 4194304,
            "modified_ts_ns": 1725729784029845548,
            "e_tag": "WIglmaXIKMFpPSkQfnArxw==",
            "fid": {
              "volume_id": 5,
              "file_key": 215,
              "cookie": 3308535656
            }
          },
          {
            "file_id": "3,d835daf163",
            "offset": 29360128,
            "size": 4194304,
            "modified_ts_ns": 1725729784038921379,
            "e_tag": "my93midHQPO2dhvkMiMkEg==",
            "fid": {
              "volume_id": 3,
              "file_key": 216,
              "cookie": 903541091
            }
          },
          {
            "file_id": "6,d9ea0cbf17",
            "offset": 33554432,
            "size": 4194304,
            "modified_ts_ns": 1725729784050575497,
            "e_tag": "VZo+RrWovPk2suE4OL1s/g==",
            "fid": {
              "volume_id": 6,
              "file_key": 217,
              "cookie": 3926703895
            }
          },
          {
            "file_id": "2,da6b2e5e43",
            "offset": 37748736,
            "size": 4194304,
            "modified_ts_ns": 1725729784062479070,
            "e_tag": "4xn5TSfx4G94lz0rf5HB6A==",
            "fid": {
              "volume_id": 2,
              "file_key": 218,
              "cookie": 1798200899
            }
          },
          {
            "file_id": "4,db77bdd906",
            "offset": 41943040,
            "size": 4194304,
            "modified_ts_ns": 1725729784070447031,
            "e_tag": "XBuH3yL7NCGEDZKgnzM+ZA==",
            "fid": {
              "volume_id": 4,
              "file_key": 219,
              "cookie": 2008930566
            }
          },
          {
            "file_id": "7,dc9a330cd6",
            "offset": 46137344,
            "size": 4194304,
            "modified_ts_ns": 1725729784078906003,
            "e_tag": "x6G2LCayjrapDXwULSdQdg==",
            "fid": {
              "volume_id": 7,
              "file_key": 220,
              "cookie": 2587036886
            }
          },
          {
            "file_id": "7,dda0ddd364",
            "offset": 50331648,
            "size": 4194304,
            "modified_ts_ns": 1725729784087845753,
            "e_tag": "Hbmhsu4NA2cEZXA6LJejoA==",
            "fid": {
              "volume_id": 7,
              "file_key": 221,
              "cookie": 2698892132
            }
          },
          {
            "file_id": "7,de89172b48",
            "offset": 54525952,
            "size": 4194304,
            "modified_ts_ns": 1725729784096323253,
            "e_tag": "r1kjcglJVd2NlEpZxjoP0Q==",
            "fid": {
              "volume_id": 7,
              "file_key": 222,
              "cookie": 2299997000
            }
          },
          {
            "file_id": "3,df3eff8aee",
            "offset": 58720256,
            "size": 4194304,
            "modified_ts_ns": 1725729784109152552,
            "e_tag": "PbiIyF7UlVRJ5UrKkUJL0g==",
            "fid": {
              "volume_id": 3,
              "file_key": 223,
              "cookie": 1056934638
            }
          },
          {
            "file_id": "1,e08af509fa",
            "offset": 62914560,
            "size": 4194304,
            "modified_ts_ns": 1725729784119920129,
            "e_tag": "ojl99REjFhlCZpL5yYUj/w==",
            "fid": {
              "volume_id": 1,
              "file_key": 224,
              "cookie": 2331314682
            }
          },
          {
            "file_id": "4,e1127d30a4",
            "offset": 67108864,
            "size": 4194304,
            "modified_ts_ns": 1725729784129834692,
            "e_tag": "Svph5FPqkKxnRWCcpjQd/Q==",
            "fid": {
              "volume_id": 4,
              "file_key": 225,
              "cookie": 310194340
            }
          },
          {
            "file_id": "7,e287ba471a",
            "offset": 71303168,
            "size": 4194304,
            "modified_ts_ns": 1725729784144751688,
            "e_tag": "GWNPbLmcRYBrJ1AblywIfA==",
            "fid": {
              "volume_id": 7,
              "file_key": 226,
              "cookie": 2277132058
            }
          },
          {
            "file_id": "2,e33371c865",
            "offset": 75497472,
            "size": 4194304,
            "modified_ts_ns": 1725729784154138682,
            "e_tag": "/5win8LBQFsC5S70Jw+6Fw==",
            "fid": {
              "volume_id": 2,
              "file_key": 227,
              "cookie": 863094885
            }
          },
          {
            "file_id": "6,e4283fd68b",
            "offset": 79691776,
            "size": 4194304,
            "modified_ts_ns": 1725729784164368449,
            "e_tag": "KIKScqDtBssg7ac5+6QdBA==",
            "fid": {
              "volume_id": 6,
              "file_key": 228,
              "cookie": 675272331
            }
          },
          {
            "file_id": "1,e5e174e8ed",
            "offset": 83886080,
            "size": 4194304,
            "modified_ts_ns": 1725729784173124315,
            "e_tag": "4LTh95jvK4RDwGDIneQlOg==",
            "fid": {
              "volume_id": 1,
              "file_key": 229,
              "cookie": 3782535405
            }
          },
          {
            "file_id": "2,e6dd618229",
            "offset": 88080384,
            "size": 4194304,
            "modified_ts_ns": 1725729784181837961,
            "e_tag": "EOMo1XsPcyHZ5KCyMqvBNg==",
            "fid": {
              "volume_id": 2,
              "file_key": 230,
              "cookie": 3714155049
            }
          },
          {
            "file_id": "6,e7039a3578",
            "offset": 92274688,
            "size": 4194304,
            "modified_ts_ns": 1725729784192382972,
            "e_tag": "lb6zn7hwR5CLhx21cHjfvQ==",
            "fid": {
              "volume_id": 6,
              "file_key": 231,
              "cookie": 60437880
            }
          },
          {
            "file_id": "7,e84b3e2e7d",
            "offset": 96468992,
            "size": 4194304,
            "modified_ts_ns": 1725729784202082685,
            "e_tag": "pg6E/giOnuWv+fbSkYZrbQ==",
            "fid": {
              "volume_id": 7,
              "file_key": 232,
              "cookie": 1262366333
            }
          },
          {
            "file_id": "4,e9a4da3567",
            "offset": 100663296,
            "size": 4194304,
            "modified_ts_ns": 1725729784211457192,
            "e_tag": "uEMotiWUokrEyYpwVWEgCQ==",
            "fid": {
              "volume_id": 4,
              "file_key": 233,
              "cookie": 2765763943
            }
          },
          {
            "file_id": "4,ea486da507",
            "offset": 104857600,
            "size": 4194304,
            "modified_ts_ns": 1725729784220450817,
            "e_tag": "occA+PBDRdDsaRvx+CGI0Q==",
            "fid": {
              "volume_id": 4,
              "file_key": 234,
              "cookie": 1215145223
            }
          },
          {
            "file_id": "7,ebf1021b11",
            "offset": 109051904,
            "size": 4194304,
            "modified_ts_ns": 1725729784229582587,
            "e_tag": "OLCS7V5kpnOKNTgcNuR7GA==",
            "fid": {
              "volume_id": 7,
              "file_key": 235,
              "cookie": 4043447057
            }
          },
          {
            "file_id": "3,ec7b8845db",
            "offset": 113246208,
            "size": 4194304,
            "modified_ts_ns": 1725729784244794420,
            "e_tag": "CSMZdy3fWfqTEiCTU8sUcQ==",
            "fid": {
              "volume_id": 3,
              "file_key": 236,
              "cookie": 2072528347
            }
          },
          {
            "file_id": "1,edce72e2b2",
            "offset": 117440512,
            "size": 4194304,
            "modified_ts_ns": 1725729784255854237,
            "e_tag": "0f/nhmHzY+Ef8vi8AE8oaw==",
            "fid": {
              "volume_id": 1,
              "file_key": 237,
              "cookie": 3463635634
            }
          },
          {
            "file_id": "4,eefa6861ec",
            "offset": 121634816,
            "size": 4194304,
            "modified_ts_ns": 1725729784265879421,
            "e_tag": "sZOAc+XXjVx9CQkfFzSJYw==",
            "fid": {
              "volume_id": 4,
              "file_key": 238,
              "cookie": 4201144812
            }
          },
          {
            "file_id": "4,efe5b4a0e1",
            "offset": 125829120,
            "size": 4194304,
            "modified_ts_ns": 1725729784275059593,
            "e_tag": "zVvrEt+YvFdXskW/uqJ82A==",
            "fid": {
              "volume_id": 4,
              "file_key": 239,
              "cookie": 3853820129
            }
          },
          {
            "file_id": "7,f0711a99c3",
            "offset": 130023424,
            "size": 4194304,
            "modified_ts_ns": 1725729784286145179,
            "e_tag": "9mwePw1gRudJiDDnJzgNtw==",
            "fid": {
              "volume_id": 7,
              "file_key": 240,
              "cookie": 1897568707
            }
          },
          {
            "file_id": "1,f1048e2365",
            "offset": 134217728,
            "size": 4194304,
            "modified_ts_ns": 1725729784296322802,
            "e_tag": "vpZ4eBeoNrwG1TWXsYZOoQ==",
            "fid": {
              "volume_id": 1,
              "file_key": 241,
              "cookie": 76424037
            }
          },
          {
            "file_id": "7,f2f5e2b796",
            "offset": 138412032,
            "size": 4194304,
            "modified_ts_ns": 1725729784306110606,
            "e_tag": "7FEkGNzBIRRx8r16LzK3lg==",
            "fid": {
              "volume_id": 7,
              "file_key": 242,
              "cookie": 4125276054
            }
          },
          {
            "file_id": "4,f3d899bff9",
            "offset": 142606336,
            "size": 4194304,
            "modified_ts_ns": 1725729784315857528,
            "e_tag": "tSV97YgNTMoU5uziGtWMIg==",
            "fid": {
              "volume_id": 4,
              "file_key": 243,
              "cookie": 3633954809
            }
          },
          {
            "file_id": "7,f40ddc1c41",
            "offset": 146800640,
            "size": 4194304,
            "modified_ts_ns": 1725729784324591606,
            "e_tag": "ibkeADQcSW6kHLuafVc9FQ==",
            "fid": {
              "volume_id": 7,
              "file_key": 244,
              "cookie": 232528961
            }
          },
          {
            "file_id": "4,f5f383fa09",
            "offset": 150994944,
            "size": 4194304,
            "modified_ts_ns": 1725729784332469898,
            "e_tag": "PTKibTPKuMEgVKqOi4P5Qg==",
            "fid": {
              "volume_id": 4,
              "file_key": 245,
              "cookie": 4085512713
            }
          },
          {
            "file_id": "4,f60d0e4cf1",
            "offset": 155189248,
            "size": 3034525,
            "modified_ts_ns": 1725729784335167859,
            "e_tag": "MNuxF2cMoLLfRThuWqxaNw==",
            "fid": {
              "volume_id": 4,
              "file_key": 246,
              "cookie": 219041009
            }
          }
        ],
        "HardLinkId": null,
        "HardLinkCounter": 0,
        "Content": null,
        "Remote": null,
        "Quota": 0
      }
    ],
    "Limit": 100000,
    "LastFileName": "vid.mp4",
    "ShouldDisplayLoadMore": false,
    "EmptyFolder": false
  }

  const videoRef = useRef(null);
  const [mediaSource, setMediaSource] = useState(null);

  useEffect(() => {
    try {
      if (!mediaSource && videoRef.current !== null) {
        const newMediaSource = new MediaSource();
        videoRef.current.src = URL.createObjectURL(newMediaSource);
        setMediaSource(newMediaSource);

        const videoChunks = seaweedfs.Entries[2].chunks
        let currSize = 0

        newMediaSource.onsourceopen = async () => {
          console.log(`${newMediaSource.readyState} should be 'open'`); // open

          console.log(MediaSource.isTypeSupported('video/mp4; codecs="avc1.64001f, mp4a.40.2"'))

          const sourceBuffer = newMediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001f, mp4a.40.2"');

          newMediaSource.duration = 999999999
          const newVideoChunks = videoChunks.filter((val, idx) => {
            return  idx <= 10 || idx > 30
          })

          for (const chunk of videoChunks) {

            currSize += chunk.size / 10e+5

            // let chunk_idx = videoChunks.indexOf(chunk)

            if (currSize > 110) {
              break
            }

            const fetchedChunk = await videoFetch(chunk.file_id);
            await new Promise((resolve) => {
              console.log(`start. fetching chunk ${chunk.file_id} - ${videoChunks.indexOf(chunk)} / ${videoChunks.length}. Size ${currSize}`);
              sourceBuffer.onupdateend = () => {
                console.log('finish. Ready for next chunk...');
                resolve();
              };
              sourceBuffer.onupdatestart = () => {
                console.log('start update');
              }
              sourceBuffer.onerror = (err) => {
                console.error('sourceBuffer error:', err)
              }
              sourceBuffer.appendBuffer(fetchedChunk);
            });
          }
          // newMediaSource.endOfStream()
        };

        videoRef.current.onerror = (err) => {
          console.error(
            `Error ${JSON.stringify(err)} ${JSON.stringify(err, ["message", "arguments", "type", "name"])}`, err
          );
        };

        console.log(videoRef.current)

      }
    } catch (e) {
      console.error(e)
    }
  }, [mediaSource]);

  const videoFetch = async (path) => {
    const url = `http://192.168.0.138:8080/${path}`
    const accessToken = localStorage.getItem('access_token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      responseType: 'arraybuffer'
    };
    try {
      const response = await axiosInstance.get(url, config);
      return response.data;

    } catch (error) {
      console.error('Error fetching video ', error)
    }
  }

  // const videoFetch = async (fileId) => {
  //   try {

  //     const url = `http://192.168.0.138:8080//${fileId}`;

  //     const response = await axiosInstance.get(url);

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch chunk: ${response.statusText}`);
  //     }


  //     const arrayBuffer = await response.arrayBuffer();

  //     return arrayBuffer;
  //   } catch (error) {
  //     console.error('Error fetching video chunk:', error);
  //     throw error;
  //   }
  // };


  return <video
    ref={videoRef}
    controls
    muted={false}
    style={{
      objectFit: "cover",
      width: '100%',
      // height: '100%'
    }}
    src={null}
  />
}

export const FollowingTimeline = () => {
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalTweets, setTotalTweets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadedData, setLoadedData] = useState([]);
  const [hasMore, setHasMore] = useState(true)
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

  useEffect(() => {
    fetchAllTweets(page);
  }, [page]);



  const fetchAllTweets = async (page) => {
    try {
      setLoading(true);

      const accessToken = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${apiUrl}/tweets/following_timeline/`,
        {
          params: {
            page: page,
            page_size: pageSize
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          withCredentials: true
        },
      );

      setTweets(response.data.tweets)
      setTotalTweets(response.data.total_tweets)
      setTotalPages(response.data.total_pages)
      setHasMore(page < response.data.total_pages)
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        // window.location.href = '/login';
        // navigate('/login')
      }
    }
  };

  // const handleScroll = () => {
  //     if (
  //         window.innerHeight +
  //         document.documentElement.scrollTop ===
  //         document.documentElement.offsetHeight
  //     ) {
  //         setPage(prevPage => prevPage + 1);
  //     }
  // };
  // useEffect(() => {
  //     window.addEventListener('scroll', handleScroll);
  //     return () =>
  //         window.removeEventListener('scroll', handleScroll);
  // }, []);


  const handleLike = async (tweetId) => {
    try {

      const accessToken = localStorage.getItem('access_token');
      const response = await axiosInstance.post(`${apiUrl}/tweets/like/${tweetId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isLiked: true,
        likes: tweet.likes + 1
      } : tweet));

    } catch (error) {
      console.log(error);
    }
  };

  const handleUnlike = async (tweetId, likeId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isLiked: false,
        likes: tweet.likes - 1
      } : tweet));
    } catch (error) {
      console.log(error);
    }
  };

  const handleRetweet = async (tweetId, originalTweetId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axiosInstance.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isRetweeted: true,
        retweets: tweet.retweets + 1
      } : tweet));
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnretweet = async (tweetId, retweetId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
        ...tweet,
        isRetweeted: false,
        retweets: tweet.retweets - 1
      } : tweet));
    } catch (error) {
      console.log(error);
    }
  };

  const [content, setContent] = useState("");
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([]);
  const handleTweetPost = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('access_token');
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append(`images`, files[i]);
      }
      formData.append(`content`, content);

      await axiosInstance.post(
        `${apiUrl}/tweets/post`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            'Authorization': `Bearer ${accessToken}`
          },
          withCredentials: true
        }
      );
      setSuccess("Tweet posted successfully!");
    } catch (error) {
      setError("Failed to post tweet.");
      console.error('Error posting tweet:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prevPreviews => [...prevPreviews, ...previewUrls]);
  };


  return (
    <>
      <VideoPlayer></VideoPlayer>
      <Container fluid>
        <Card className="mt-5">
          <Card.Body>
            <Form onSubmit={handleTweetPost}>
              <Form.Group controlId="formTweet">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={content}
                  placeholder="What's happening?"
                  onChange={(e) => setContent(e.target.value)}
                  required />
              </Form.Group>
              <Tooltip title="Media">
                <div style={{ position: "relative", width: '4vw', height: '4vh' }}>
                  <input
                    onChange={handleFileChange}
                    type="file"
                    title=""
                    multiple
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      zIndex: 2,
                      cursor: 'pointer'
                    }} />
                  <img src={media} alt="media" title="media content"
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      zIndex: 1
                    }} />
                </div>
              </Tooltip>

              <div style={{ display: "flex", justifyContent: "end" }}>
                <Button variant="primary" type="submit">
                  Tweet
                </Button>
              </div>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}
            </Form>
            {/* <div>
                            {previews.map((preview, index) => (

                                <div
                                    style={{ display: "inline-block" }}
                                    onMouseOver={event => {
                                        document.getElementById(`${index}-post-img`).style.opacity = 100;
                                    } }
                                    onMouseOut={event => {
                                        document.getElementById(`${index}-post-img`).style.opacity = 0;
                                    } }>
                                    <img key={`${index}-x`} src={close_icon} onClick={() => {
                                        setPreviews(previews.filter((value, index1) => {
                                            return index1 !== index;
                                        }));
                                    } } style={{
                                        transform: "rotateY(0deg) rotate(45deg)",
                                        position: 'absolute',
                                        zIndex: 2,
                                        width: '25px',
                                        height: '25px',
                                        margin: '10px',
                                        opacity: 0
                                    }} alt={"X"} />
                                    <img key={`${index}-post-img`} src={preview} alt="preview"
                                        style={{ width: '100px', height: '100px', margin: '10px' }} />
                                </div>
                            ))}
                        </div> */}
          </Card.Body>
        </Card>
      </Container><Container className="container mt-5 text-center">
        {loading ? <p key="loading_tweets"> Loading... </p> : (
          // video test
          <>

            <div>
              {/* <Tooltip title="Media">
                <div style={{position: "relative", width: '4vw', height: '4vh'}}>
                    <input
                        onChange={handleTestVideoChange}
                        type="file"
                        title=""
                        multiple
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            zIndex: 2,
                            cursor: 'pointer'
                        }}/>
                    <img src={media} alt="media" title="media content"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            zIndex: 1
                        }}/>
                </div>
            </Tooltip> */}
            </div><div>
              {Array.isArray(tweets) && tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard
                    key={tweet.id}
                    originalTweetImg={tweet.original_tweet}
                    tweet={tweet}
                    handleLike={handleLike}
                    handleUnlike={handleUnlike}
                    handleRetweet={handleRetweet}
                    handleUnretweet={handleUnretweet} />
                ))
              ) : (
                <p>No tweets available.</p>
              )}
              {/* {
!loading &&
!hasMore &&
<div>
No more data
</div>
} */}

            </div></>
        )}
        <Row className="pagination-controls">
          <Col>
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}> Previous</Button>

          </Col>
          <Col>
            <p>{page}</p>

          </Col>
          <Col>
            <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>

          </Col>
        </Row>
      </Container></>


  );
};
