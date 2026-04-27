"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const categories_controller_1 = require("../controllers/categories.controller");
const categoryController = inversify_config_1.container.get(categories_controller_1.CategoryController);
const categoriesRouter = (0, express_1.Router)();
exports.categoriesRouter = categoriesRouter;
categoriesRouter.post('/', async (req, res, next) => {
    try {
        await categoryController.createCategory(req, res);
    }
    catch (error) {
        next(error);
    }
});
categoriesRouter.get('/client/:clientId', async (req, res, next) => {
    try {
        await categoryController.getCategories(req, res);
    }
    catch (error) {
        next(error);
    }
});
categoriesRouter.get('/:categoryId', async (req, res, next) => {
    try {
        await categoryController.getCategoryById(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=categories.router.js.map