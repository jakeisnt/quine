import { Path } from "../../src/utils/path";

const PATH_DELIMITER = " / ";

const collectFolderPaths = (
  pathList: string[],
  title: string,
  {
    rootUrl,
    sourceDir,
  }: {
    rootUrl: string;
    sourceDir: string;
  },
  curPath: string = ""
) => {
  if (!pathList?.[1]) {
    return [
      ["span", PATH_DELIMITER],
      ["b", title],
    ];
  }

  const firstPath = pathList[0];
  const restPaths = pathList.slice(1);

  const nextCurPath = curPath + "/" + firstPath;

  return [
    ["span", PATH_DELIMITER],
    ["a", { href: `${rootUrl}${nextCurPath}/index.html` }, firstPath],
    ...collectFolderPaths(
      restPaths,
      title,
      {
        rootUrl,
        sourceDir,
      },
      nextCurPath
    ),
  ];
};

const makeSidebar = ({
  path,
  title,
  sourceDir,
  rootUrl,
}: {
  path: Path;
  title: string;
  sourceDir: string;
  rootUrl: string;
}) => {
  const pathList = path.relativeTo(sourceDir).relativePathArray;

  const folderPaths = collectFolderPaths(pathList, title, {
    rootUrl,
    sourceDir,
  });

  return [
    "div",
    { class: "sidebar" },
    [
      "div",
      { class: "url-path" },
      pathList?.length ? ["b", "jake."] : ["a", { href: "/" }, "jake."],
      folderPaths,
    ],
    ["ToggleDarkMode"],
  ];
};

const Sidebar = (args) => ({
  dependsOn: [{ src: "/components/Sidebar/sidebar.css" }],
  body: makeSidebar(args),
});

export default Sidebar;
