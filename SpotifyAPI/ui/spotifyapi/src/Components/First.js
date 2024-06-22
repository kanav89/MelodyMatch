import React from "react";
import "./First.css";
import { HiOutlineArrowRight } from "react-icons/hi";
import { Button } from "flowbite-react";
import { useHistory } from "react-router-dom";

function First() {
  const history = useHistory();

  return (
    <div class="firstdiv my-8">
      <h1 class="heading">MelodyMatch</h1>
      <p class="description">
        INSTANTLY MAKE A SPOTIFY PLAYLIST TO SUIT YOUR MOOD AND TASTE
      </p>
      <div className="h-32 my-16">
        <Button size="lg" onClick={() => history.push("/form")}>
          Let's Get Started
          <HiOutlineArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default First;
