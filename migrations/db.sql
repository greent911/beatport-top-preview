CREATE DATABASE trackDB;
USE trackDB;
CREATE TABLE top_tracks (
    num int NOT NULL,
    type varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    artists varchar(255) NOT NULL,
    remixers varchar(255),
    labels varchar(255),
    genre varchar(255),
    released date,
    link varchar(255) NOT NULL,
    imglink text,
    video_id varchar(255),
    created_at datetime NOT NULL,
    updated_at datetime NOT NULL,
    PRIMARY KEY (num,type)
);