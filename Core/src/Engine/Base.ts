namespace Fudge {
    /**
     * Base class for [[Node]], [[Component]] and more. Abstracts methods needed by all such as serialization
     */
    export abstract class Base {
        /**
         * Returns a JSON-String representing the data needed to recreate an object of the applicable subclass
         */
        public serialize(): string {
            return "";
        }
        public deserialize(): Base {
            return null;
        }
    }
}