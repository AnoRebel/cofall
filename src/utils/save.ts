import FileSaver from "file-saver";
import { fileExts as fileExtensions } from "./options";

const save = (
  data: { code: any; title: string; lang: string },
): void => {
  const fileExtension = (lang: any): string => fileExtensions[lang];

  const fileNameify = (name: string): string => name.split(" ").join("_");

  const blob = new Blob([data.code], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(
    blob,
    `${fileNameify(data.title)}.${fileExtension(data.lang)}`,
  );
};

export default save;
