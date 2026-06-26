import biliGame from "../web/pagesModel/biliGame.js";

if (biliGame.isUrlPage(location.href)) {
    biliGame.checkVideoList();
}
