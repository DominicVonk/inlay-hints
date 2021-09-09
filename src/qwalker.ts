export default function walker(tree: any, callback: Function) {
    try {
        for (var _tree of tree) {
            if (_tree?.children) {
                walker(_tree?.children, callback);
            }
            callback(_tree);
        }
    } catch (e) {
        if (tree?.children) {
            walker(tree?.children, callback);
        }
        callback(tree);
    }

}