import FileDescription from "../util/FileDescription";

const sampleFile:FileDescription = {
    path: "sample.dot",
    contents: `strict digraph {
    clusterrank=local
    compound=true
    ranksep=3.0
    nodesep=0.5

    subgraph Elements1 {
        label="Elements 1"
        cluster=true
        a
        b
        c
        "two words"
    }

    subgraph Elements2 {
        label="Elements 2"
        cluster=true
        d
        e
        f
        "with three words"
    }

    subgraph MainFlow {
        a -> d [label="sample label"]
        b -> e [label="another one"]
        c -> f [label="one more"]
        "two words" -> { "three words" a b c } -> { d e f }
        subgraph BackFlow {
            e -> b
            f -> c
        }
    }
}`  ,
    id: "sample",
}
export default sampleFile;
