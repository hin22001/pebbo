"use client";
import React from "react";
import moment from "moment";

export default class Timer extends React.Component {
  constructor() {
    super();
    this.state = {
      currentTime: 0,
      targetTime: 0,
      jump: 1,
      tick: 1000, // second => for time interval
      isFinished: false,
    };
  }

  assignProps() {
    if (this.props.type == "dateTime") {
      let currentTime = moment(this.props.currentTime || new Date());

      const targetTime = moment(this.props.targetTime || this.state.targetTime);

      const diff = targetTime.diff(currentTime);

      const duration = moment.duration(diff);

      currentTime = this.getDateTimeMomentDuration(duration);

      this.setState({
        currentTime,
        targetTime,
        tick: this.props.tick || this.state.tick,
        jump: this.props.jump || 1000, // on milliseconds
        duration,
      });
    } else {
      this.setState({
        currentTime: this.props.currentTime || this.state.currentTime,
        targetTime: this.props.targetTime || this.state.targetTime,
        tick: this.props.tick || this.state.tick,
        jump: this.props.jump || this.state.jump,
      });
    }
  }

  getDateTimeMomentDuration(value) {
    try {
      function getDoubleDigit(val = "00") {
        const refactorVal = val.toString();
        return refactorVal.length < 2 ? "0" + refactorVal : refactorVal;
      }

      const result =
        getDoubleDigit(value.hours() + value.days() * 24) +
        ":" +
        getDoubleDigit(value.minutes()) +
        ":" +
        getDoubleDigit(value.seconds());

      return result;
    } catch (err) {}
  }
  tick() {
    try {
      const {
        state: { currentTime, targetTime, jump, duration },
        props: { handleFinish },
      } = this;

      let newTime, newDuration;

      if (this.props.type == "dateTime") {
        if (
          duration &&
          this.getDateTimeMomentDuration(duration) != "00:00:00"
        ) {
          newDuration = moment.duration(duration + jump, "milliseconds");

          newTime = this.getDateTimeMomentDuration(newDuration);
        } else {
          clearInterval(this.timer);

          if (handleFinish) {
            handleFinish(true);
          }

          newTime = "00:00:00";
        }
      } else {
        newTime = currentTime + jump;
      }

      this.setState({
        currentTime: newTime,
        duration: newDuration,
      });
    } catch (err) {}
  }
  componentDidMount() {
    this.assignProps();
    this.timer = setInterval(() => this.tick(), this.state.tick);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.currentTime != this.props.currentTime ||
      prevProps.targetTime != this.props.targetTime
    ) {
      this.assignProps();
    }
    if (prevProps.reset != this.props.reset) {
      this.setState({
        currentTime: 0,
        targetTime: 0,
        jump: 1,
        tick: 1000, // second => for time interval
        isFinished: false,
      });
      this.assignProps();
    }
    if (prevState.currentTime != this.state.currentTime) {
      if (this.props.handleChange) {
        this.props.handleChange(this.state.currentTime);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const {
      state: { currentTime, isFinished },
      props: { type, string1, string2, format, theme, hideOnFinish },
    } = this;

    let formatTime = currentTime;

    if (type == "dateTime" && format == "(mm:ss)") {
      formatTime = "(" + currentTime.toString().slice(3, 8) + ")";
    }

    return (
      <>
        {!(hideOnFinish && isFinished) && (
          <div className={"elements-countdown " + (theme || "")}>
            <p className="text">
              {string1 && (
                <>
                  <span>{string1}</span>
                  <span> </span>
                </>
              )}
              <span className="text-highlight">{formatTime}</span>
              {string2 && (
                <>
                  <span> </span>
                  <span>{string2}</span>
                </>
              )}
            </p>
          </div>
        )}
      </>
    );
  }
}
