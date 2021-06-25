namespace FudgeCore {
  export const enum EVENT_AUDIO {
    /** broadcast to a {@link Node} and all its descendants in the graph after it was appended to a parent */
    CHILD_APPEND = "childAppendToAudioGraph",
    /** broadcast to a {@link Node} and all its descendants in the graph just before its being removed from its parent */
    CHILD_REMOVE = "childRemoveFromAudioGraph",
    /** broadcast to a {@link Node} and all its descendants in the graph to update the panners in AudioComponents */
    UPDATE = "updateAudioGraph",
    /** fired when the audio file was loaded and is ready for playing */
    READY = "ready",
    /** fired when the end of the audio is reached while playing */
    ENDED = "ended"
  }
}