export function getListEmptyCopy(listName?: string): { heading: string; hint: string } {
  switch (listName) {
    case "Want To Read":
      return {
        heading: "Nothing queued yet",
        hint: "Search for a book you want to pick up next.",
      };
    case "Currently Reading":
      return {
        heading: "No book in progress",
        hint: "Start reading something and it will land on this shelf.",
      };
    case "Finished":
      return {
        heading: "No finished books yet",
        hint: "Completed reads will gather here.",
      };
    case "Did Not Finish":
      return {
        heading: "No set-aside books",
        hint: "Books you stop partway through will show up here.",
      };
    default:
      return {
        heading: listName ? "This list is empty" : "This shelf is empty",
        hint: "Search for a book to add it to this list.",
      };
  }
}
