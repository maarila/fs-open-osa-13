CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0,
);

INSERT INTO blogs (author, url, title) VALUES ('Pekka Blogi', 'http://blogtest.com/', 'Näin kirjoitat blogin');
INSERT INTO blogs (author, url, title) VALUES ('Maija M.', 'http://blogtesti2.com/', 'Blogielämää');
