import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { createAddBooksToListTool } from "@/src/lib/ai/tools/add-books-to-list";
import { createCreateCustomListTool } from "@/src/lib/ai/tools/create-custom-list";
import { createGetBookDetailsTool } from "@/src/lib/ai/tools/get-book-details";
import { createGetListBooksTool } from "@/src/lib/ai/tools/get-list-books";
import { createGetReadingActivityTool } from "@/src/lib/ai/tools/get-reading-activity";
import { createGetUserLibraryTool } from "@/src/lib/ai/tools/get-user-library";
import { createRemoveBooksFromListTool } from "@/src/lib/ai/tools/remove-books-from-list";
import { createSearchBooksTool } from "@/src/lib/ai/tools/search-books";

export function createChatTools(ctx: AiToolContext) {
  return {
    get_user_library: createGetUserLibraryTool(ctx),
    get_reading_activity: createGetReadingActivityTool(ctx),
    search_books: createSearchBooksTool(ctx),
    get_book_details: createGetBookDetailsTool(),
    get_list_books: createGetListBooksTool(ctx),
    create_custom_list: createCreateCustomListTool(ctx),
    add_books_to_list: createAddBooksToListTool(ctx),
    remove_books_from_list: createRemoveBooksFromListTool(ctx),
  };
}

export type ChatTools = ReturnType<typeof createChatTools>;
