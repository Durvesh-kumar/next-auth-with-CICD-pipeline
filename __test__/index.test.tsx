import Home from "@/app/(dashboard)/page";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
// import Home from "../pages/index"; // Adjust the import to match your component

test("renders home page", () => {
    render(<Home />);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
});
