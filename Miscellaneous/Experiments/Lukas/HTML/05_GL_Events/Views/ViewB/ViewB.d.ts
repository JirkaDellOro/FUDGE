declare namespace GLEventTest {
    class ViewB extends View {
        constructor(_parent: Panel);
        fillContent(): void;
        addEvents(): void;
        changeHandler(_e: CustomEvent): void;
    }
}
