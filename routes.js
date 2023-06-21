const express = require("express");
const router = express.Router();


const hakAkses = require("./controllers/hakAkses.controller.js");
const perspective = require("./controllers/perspective.controller.js");
const strategic_objectives = require("./controllers/strategic_objectives.controller.js");
const count_optimized = require("./controllers/count_optimized.controller.js");
const cat_score = require("./controllers/cat_score.controller.js");
const kpi = require("./controllers/kpi.controller.js");
const target = require("./controllers/target.controller.js");
const trn_kpi = require("./controllers/trn_kpi.controller.js");


const upload = require("./middlewares/upload");



let routes = (app) => {

  
  
  router.get('/test', (req, res) => {
	  res.send('Tespuck');
	});
	
  router.post("/hakAkses/auth", hakAkses.auth);
  router.post("/hakAkses/auth", hakAkses.auth);
  router.post("/hakAkses/listBu", hakAkses.listBu);

  //router.get("/hakAkses/list/:userlogin?/:akses?", hakAkses.list);
  router.post("/hakAkses/listHris", hakAkses.listHris);
  router.post("/hakAkses/listfilterHris", hakAkses.listfilterHris);
  router.post("/hakAkses/list", hakAkses.list);
  router.get("/hakAkses/view", hakAkses.view);
  router.post("/hakAkses/add", hakAkses.add);
  router.post("/hakAkses/edit", hakAkses.edit);
  router.post("/hakAkses/edit_map_bu", hakAkses.edit_map_bu);
  router.post("/hakAkses/update", hakAkses.update);
  router.post("/hakAkses/delete", hakAkses.delete);

  router.post("/perspective/list", perspective.list);
  router.get("/perspective/view", perspective.view);
  router.post("/perspective/add", perspective.add);
  router.post("/perspective/duplicate", perspective.duplicate);
  router.post("/perspective/update", perspective.update);
  router.post("/perspective/delete", perspective.delete);

  router.post("/strategic_objectives/list", strategic_objectives.list);
  router.get("/strategic_objectives/view", strategic_objectives.view);
  router.post("/strategic_objectives/listuser", strategic_objectives.listuser);
  router.post("/strategic_objectives/liststrategic", strategic_objectives.liststrategic);
  router.post("/strategic_objectives/kodeurut", strategic_objectives.kodeurut);
  router.post("/strategic_objectives/add", strategic_objectives.add);
  router.post("/strategic_objectives/duplicate", strategic_objectives.duplicate);
  router.post("/strategic_objectives/update", strategic_objectives.update);
  router.post("/strategic_objectives/delete", strategic_objectives.delete);


  router.post("/count_optimized/list", count_optimized.list);
  router.post("/count_optimized/list2", count_optimized.list2);
  router.get("/count_optimized/view", count_optimized.view);
  router.post("/count_optimized/add", count_optimized.add);
  router.post("/count_optimized/duplicate", count_optimized.duplicate);
  router.post("/count_optimized/update", count_optimized.update);
  router.post("/count_optimized/delete", count_optimized.delete);

  router.post("/cat_score/list", cat_score.list);
  router.get("/cat_score/view", cat_score.view);
  router.post("/cat_score/add", cat_score.add);
  router.post("/cat_score/duplicate", cat_score.duplicate);
  router.post("/cat_score/update", cat_score.update);
  router.post("/cat_score/delete", cat_score.delete);

  router.get("/kpi/list", kpi.list);
  router.get("/kpi/view", kpi.view);
  router.post("/kpi/add", kpi.add);
  router.post("/kpi/update", kpi.update);
  router.post("/kpi/delete", kpi.delete);
  router.post("/kpi_sub/list", kpi.list_sub);
  router.post("/kpi_sub/add", kpi.add_sub);
  router.post("/kpi_sub/update", kpi.update_sub);
  router.post("/kpi_sub/delete", kpi.delete_sub);

  router.post("/target/list", target.list);
  router.get("/target/view", target.view);
  router.post("/target/add", target.add);
  router.post("/target/update", target.update);
  router.post("/target/delete", target.delete);
  router.get("/target/template", target.template);
  router.post("/target/upload", upload.single("file"), target.upload);



  router.get("/trn_kpi/view", trn_kpi.view);
  router.post("/trn_kpi/generate/hapus", trn_kpi.hapus);
  router.post("/trn_kpi/generate/selesai", trn_kpi.selesai);
  router.post("/trn_kpi/generate/proses", trn_kpi.proses);

  router.post("/trn_kpi/calc_ach", trn_kpi.calc_ach);
  router.post("/trn_kpi/calc_save", trn_kpi.calc_save);
  router.post("/trn_kpi/remark_save", trn_kpi.remark_save);

  router.post("/trn_kpi/lm_kpi", trn_kpi.lm_kpi);

  router.post("/trn_kpi/sendEmailer", trn_kpi.sendEmailer);

  router.post("/trn_kpi/sync", trn_kpi.sync);

  router.post("/trn_kpi/sync_save", trn_kpi.sync_save);

  router.get("/trn_kpi/view/issue", trn_kpi.view_issue);
  router.post("/trn_kpi/input_issue", trn_kpi.input_issue);
  // router.post("/subregion/add", subregion.postSubregionAdd);
  // router.post("/subregion/upload", upload.single("file"), subregion.postSubregionUpload);
  // router.get("/subregion/download", subregion.getSubregionDownload);
  // router.get("/subregion/template", subregion.getSubregionTemplate);


  //app.use("/dbl", router);
  app.use("", router);
};

module.exports = routes;
