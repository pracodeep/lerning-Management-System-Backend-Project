import { Router } from "express";
import { addLectureByCourseId, createCourse, getAllCourses, getLectureByCourseId, removeCourse, updateCourse } from "../controllers/course.controller.js";
import { authorisedRoles, isloggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multure.middleware.js";

const router= Router();

router.get('/',isloggedIn,getAllCourses)

router.get('/:id',getLectureByCourseId)
router.post('/',isloggedIn,authorisedRoles('ADMIN'),upload.single('thumbnail'),createCourse)
router.put('/:id',isloggedIn,authorisedRoles('ADMIN'),updateCourse)
router.delete('/:id',isloggedIn,authorisedRoles('ADMIN'),removeCourse)
router.post('/:id',isloggedIn,authorisedRoles('ADMIN'),upload.single('lectures'),addLectureByCourseId)
export default router

