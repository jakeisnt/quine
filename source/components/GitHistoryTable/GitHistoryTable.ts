const makeGitHistoryTable = ({ file }) => {
  const log = file.log;

  // If we don't have a revision log for the file,
  // don't render the git history table at all
  if (!file.log.length) {
    return null;
  }

  const tableRows = log.map((entry) => {
    return [
      "tr",
      ["td", { class: "commit-date-tr" }, entry.date],
      ["td", { class: "commit-link-tr" }, entry.shortHash],
    ];
  });

  const table = [
    "div",
    { class: "git-history-table-container" },
    ["span", { class: "git-history-table-title" }, "Revisions"],
    [
      "table",
      { class: "git-history-table" },
      ["thead", ["tr", ["th", "Date"], ["th", "Hash"]]],
      ["tbody", ...tableRows],
    ],
  ];

  return table;
};

const GitHistoryTable = ({ file }) => ({
  dependsOn: [],
  body: makeGitHistoryTable({ file }),
});

export default GitHistoryTable;
