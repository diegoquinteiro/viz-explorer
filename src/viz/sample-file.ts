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
            }

            subgraph Elements2 {
                label="Elements 2"
                cluster=true
                d
                e
                f
            }

            subgraph MainFlow {
                a -> d
                b -> e
                c -> f
                subgraph BackFlow {
                    d -> a
                    e -> b
                    f -> c
                }
            }
        }`,
}
export default sampleFile;
