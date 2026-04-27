"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const exams_controller_1 = require("../controllers/exams.controller");
const examController = inversify_config_1.container.get(exams_controller_1.ExamController);
const examRouter = (0, express_1.Router)();
exports.examRouter = examRouter;
examRouter.get('/class/latest/:classId', async (req, res, next) => {
    try {
        await examController.getLatestExamVersion(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.get('/admin/:examId', async (req, res, next) => {
    try {
        await examController.getAdminExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.get('/class/:classId', async (req, res, next) => {
    try {
        await examController.getAllClassExams(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// TODO: USE ENDPOINT ON CLIENT TO DISPLAY VERSIONS SIDEBAR
examRouter.get('/class/versions/:classId', async (req, res, next) => {
    try {
        await examController.getAllClassExamsMetadataOnly(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.get('/dashboard', async (req, res, next) => {
    try {
        await examController.getExamsDashboard(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.get('/attempts/exam/:examId/user/:userId', async (req, res, next) => {
    try {
        await examController.getUserExamAttempts(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.post('/', async (req, res, next) => {
    try {
        await examController.createExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.put('/:examId', async (req, res, next) => {
    try {
        await examController.updateExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.delete('/:examId', async (req, res, next) => {
    try {
        await examController.deleteExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// STUDENT FACING
examRouter.get('/class/:classId/user', async (req, res, next) => {
    try {
        await examController.getUserExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.post('/standalone', async (req, res, next) => {
    try {
        await examController.createStandaloneExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.put('/standalone/title/:standaloneExamId', async (req, res, next) => {
    try {
        await examController.updateStandaloneExamName(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.put('/standalone/admin/request-approval/:standaloneExamId', async (req, res, next) => {
    try {
        await examController.requestStandaloneExamApproval(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.put('/standalone/admin/approve/:standaloneExamId', async (req, res, next) => {
    try {
        await examController.approveStandaloneExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// TODO: REVISAR LA ESTRUCTURA DE DATOS QUE ESTOY ENVIANDO AL FRONTEND PAR Y USAR EL NOMBRE CORRECTAMENTE EN EL FRONTEND
examRouter.get('/standalone/:standaloneExamId', async (req, res, next) => {
    try {
        await examController.getStandaloneExam(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
examRouter.get('/standalone/:standaloneExamId/metadata', async (req, res, next) => {
    try {
        await examController.getStandaloneExamMetadata(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// TODO: REVISAR LA ESTRUCTURA DE DATOS QUE ESTOY ENVIANDO AL FRONTEND PAR Y USAR EL NOMBRE CORRECTAMENTE EN EL FRONTEND
examRouter.get('/standalone/admin/waiting-for-approval', async (req, res, next) => {
    try {
        await examController.getStandaloneExamsWaitingForApproval(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// TODO: REVISAR LA ESTRUCTURA DE DATOS QUE ESTOY ENVIANDO AL FRONTEND
examRouter.get('/standalone/admin/mine', async (req, res, next) => {
    try {
        await examController.getMyStandaloneExams(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=exams.router.js.map