from bs4 import element

def get_tag_count(root):
    """Given a root tag, return the count of tags

    Traverse the beautiful soup parse tree and compute tag frequency
    
    Args:
        root (bs4.element.Tag): The root of the parse tree

    Returns:
        dict:  a dictionary of tag name to frequency
    """
    def dfs(node, result):
        for c in node.children:
            if isinstance(c, element.Tag):
                dfs(c, result)
        tag_name = node.name
        if tag_name in result:
            result[tag_name] += 1
        else:
            result[tag_name] = 1
    result = {}
    dfs(root, result)
    return result

