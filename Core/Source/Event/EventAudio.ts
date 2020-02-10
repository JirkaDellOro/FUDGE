namespace FudgeCore {
    export const enum EVENT_AUDIO {
      /** broadcast to a [[Node]] and all [[Nodes]] in the branch it's the root of after it was appended to a parent */
      CHILD_APPEND = "childAppendToAudioBranch",
      /** broadcast to a [[Node]] and all [[Nodes]] in the branch it's the root of just before its being removed from its parent */
      CHILD_REMOVE = "childRemoveFromAudioBranch",
      /** broadcast to a [[Node]] and all [[Nodes]] in the branch to update the panners in AudioComponents */
      UPDATE = "updateAudioBranch"
    }
}