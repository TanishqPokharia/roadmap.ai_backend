interface IRoadmapMetaData {
    id: string;
    title: string;
    description: string;
    completedSubgoals: number;
    goalsCount: number;
    subgoalsCount: number;
    postId: string | null;
}