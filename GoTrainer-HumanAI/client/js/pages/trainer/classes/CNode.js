class CNode {
    y;
    x;

    value;

    parent;
    children;
    nodes;


    constructor(parent, value, x = 0, y = 0) {
        this.y = y;
        this.x = x;

        this.value = value;

        this.parent = parent;
        this.children = [];
        this.nodes = parent ? parent.nodes : new History();
        this.nodes.add(this, x, y);
    }


    add(value, x, y) {
        if (y == null) y = this.y;

        let newNode = new CNode(this, value, x, y);
        this.children.push(newNode);

        return newNode;
    }
}
