﻿import supertest from "supertest";
import {app} from "./app";
import {mocked} from "ts-jest/utils";
import * as editors from "./database/editors";
import * as timeline from "./database/timeline";
import * as articles from "./database/articles";

jest.mock("./database/editors");
jest.mock("./database/timeline");
jest.mock("./database/articles");

const request = supertest(app);

const mockInsertEditor = mocked(editors.insertEditor);
const mockGetEditorByEmail = mocked(editors.getEditorByEmail);
const mockInsertTimelineItem = mocked(timeline.insertTimelineItem);
const mockInsertArticle = mocked(articles.insertArticle);

describe("admin routes", () => {
    
    describe("home", () => {
        
        it("GET returns 200", async done => {
            const response = await request.get("/admin/home");
            expect(response.status).toBe(200);
            done();
        });
    });
    
    describe("Editors", () => {
        
        describe("Add New Editor", () => {
            
            it("GET returns 200", async done => {
                const response = await request.get("/admin/editors/new");
                expect(response.status).toBe(200);
                done();
            });
            
            it("POST returns 200 if data is valid", async done => {
                mockInsertEditor.mockReturnValue(Promise.resolve());
                const response = await request
                    .post('/admin/editors/new')
                    .send("email=email&password=password")
                    .set("Accept", "x-www-form-urlencoded");
                expect(response.status).toBe(200);
                expect(response.text).toBe("okay");
                done();
            });
            
            it("POST fails (400) if email is missing", async done => {
                const response = await request
                    .post('/admin/editors/new')
                    .send("password=password")
                    .set("Accept", "x-www-form-urlencoded");
                expect(response.status).toBe(400);
                expect(response.text).toBe("Please enter a valid email");
                done();
            });

            it("POST fails (400) if password is missing", async done => {
                const response = await request
                    .post('/admin/editors/new')
                    .send("email=email")
                    .set("Accept", "x-www-form-urlencoded");
                expect(response.status).toBe(400);
                expect(response.text).toBe("Please enter a valid password");
                done();
            });
        });
    });
    
    describe("Sign In", () => {
        
        it("GET returns 200", async done => {
            const response = await request.get("/admin/sign-in");
            expect(response.status).toBe(200);
            done();
        });

        it("POST returns 200 if request is valid", async done => {
            const editor = { id: 10, email: "john4.doe@gmail.com", salt: "yhzvD1+chPZCfg==", hashed_password: "YEYWeCNALZFGtzyzkxXDVTR6ev6qpNJrrSvMmoWiCyQ=" };
            mockGetEditorByEmail.mockResolvedValue(editor);
            const response = await request
                .post('/admin/sign-in')
                .send("email=email&password=password4")
                .set("Accept", "x-www-form-urlencoded");
            expect(response.redirect).toBe(true)
            expect(response.header.location).toBe("/home")
            done();
        });

        it("POST fails if the email is wrong", async done => {
            mockGetEditorByEmail.mockResolvedValue(undefined);
            const response = await request
                .post('/admin/sign-in')
                .send("email=dsadsadsa&password=password4")
                .set("Accept", "x-www-form-urlencoded");
            expect(response.redirect).toBe(true)
            expect(response.header.location).toBe("/admin/sign-in")
            done();
        });

        it("POST fails if the password is wrong", async done => {
            const editor = { id: 10, email: "john4.doe@gmail.com", salt: "yhzvD1+chPZCfg==", hashed_password: "YEYWeCNALZFGtzyzkxXDVTR6ev6qpNJrrSvMmoWiCyQ=" };
            mockGetEditorByEmail.mockResolvedValue(editor);
            const response = await request
                .post('/admin/sign-in')
                .send("email=email&password=password4dasda")
                .set("Accept", "x-www-form-urlencoded");
            expect(response.redirect).toBe(true)
            expect(response.header.location).toBe("/admin/sign-in")
            done();
        });

        it("POST fails if email is missing", async done => {
            const response = await request
                .post('/admin/sign-in')
                .send("email=&password=password")
                .set("Accept", "x-www-form-urlencoded");
            expect(response.status).toBe(302);
            expect(response.header.location).toBe("/admin/sign-in");
            done();
        });

        it("POST fails if password is missing", async done => {
            const response = await request
                .post('/admin/sign-in')
                .send("email=email&password=")
                .set("Accept", "x-www-form-urlencoded");
            expect(response.status).toBe(302);
            expect(response.header.location).toBe("/admin/sign-in");
            done();
        });
    });
    
    describe("Articles", () => {

        describe("Add new Article", () => {

            it("GET returns 200", async done => {
                const response = await request.get("/admin/articles/new");
                expect(response.status).toBe(200);
                done();
            });

            it("POST returns 200", async done => {
                mockInsertArticle.mockResolvedValue();
                const response = await request
                    .post('/admin/articles/new')
                    .send("imageUrl=imageUrl&title=title&summary=summary&articleUrl=articleUrl&publishDate=publishDate")
                    .set("Accept", "x-www-form-urlencoded");
                expect(response.status).toBe(200);
                done();
            });
        });
    });
    
    describe("Timelines", () => {
        
        describe("Add new Timeline Item", () => {

            it("GET returns 200", async done => {
                const response = await request.get('/admin/rovers/timeline/new')
                expect(response.status).toBe(200);
                done()
            });
            
            it("POST returns 200", async done => {
                mockInsertTimelineItem.mockResolvedValue();
                const response = await request
                    .post('/admin/rovers/timeline/new')
                    .send("rover_name=rover_name&image_url=image_url&heading=heading&timeline_entry=timeline_entry&date=date")
                    .set("Accept", "x-www-form-urlencoded");
                expect(response.status).toBe(200)
                done();
            });
        });
    });
});