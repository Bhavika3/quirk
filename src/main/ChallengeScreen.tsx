import React from "react";
import theme from "../theme";
import {
  MediumHeader,
  HintHeader,
  ActionButton,
  Row,
  GhostButton,
  Container,
} from "../ui";
import { textInputStyle } from "./textInputStyle";
import { textInputPlaceholderColor } from "../form/textInputStyle";
import i18n from "../i18n";
import * as stats from "../stats";
import ScreenProps from "../ScreenProps";
import Constants from "expo-constants";
import { get } from "lodash";
import { Thought } from "../thoughts";
import {
  ALTERNATIVE_SCREEN,
  DISTORTION_SCREEN,
  FINISHED_SCREEN,
} from "./screens";
import { TextInput } from "react-native";
import { saveExercise } from "../thoughtstore";
import haptic from "../haptic";
import { Haptic } from "expo";

export default class ChallengeScreen extends React.Component<
  ScreenProps,
  {
    thought?: Thought;
    isEditing: boolean;
  }
> {
  static navigationOptions = {
    header: null,
  };

  state = {
    thought: undefined,
    isEditing: false,
  };

  componentDidMount() {
    this.props.navigation.addListener("willFocus", args => {
      const thought = get(args, "state.params.thought");
      const isEditing = get(args, "state.params.isEditing", false);
      this.setState({
        thought,
        isEditing,
      });
    });
  }

  onChange = (txt: string) => {
    this.setState(prevState => {
      if (!prevState.thought) {
        return prevState;
      }

      prevState.thought.challenge = txt;
      return prevState;
    });
  };

  onNext = async () => {
    haptic.impact(Haptic.ImpactFeedbackStyle.Light);
    const thought = await saveExercise(this.state.thought);
    this.props.navigation.push(ALTERNATIVE_SCREEN, {
      thought,
    });
  };

  // From editing
  onFinish = async () => {
    haptic.impact(Haptic.ImpactFeedbackStyle.Light);
    const thought = await saveExercise(this.state.thought);
    this.props.navigation.push(FINISHED_SCREEN, {
      thought,
    });
  };

  render() {
    return (
      <Container
        style={{
          paddingTop: 24 + Constants.statusBarHeight,
          backgroundColor: theme.lightOffwhite,
          flex: 1,
        }}
      >
        {this.state.thought && (
          <>
            <MediumHeader>{i18n.t("challenge")}</MediumHeader>
            <HintHeader>
              In your own words, write out what about your thought is distorted.
            </HintHeader>

            <TextInput
              style={textInputStyle}
              placeholderTextColor={textInputPlaceholderColor}
              placeholder={i18n.t("cbt_form.auto_thought_placeholder")}
              value={this.state.thought.challenge}
              multiline={true}
              numberOfLines={6}
              autoFocus={true}
              onChangeText={this.onChange}
              onBlur={() => stats.userFilledOutFormField("challenge")}
            />

            <Row
              style={{
                marginTop: 24,
                justifyContent: "flex-end",
              }}
            >
              {this.state.isEditing ? (
                <ActionButton
                  title={"Save"}
                  onPress={() => this.onFinish()}
                  width={"100%"}
                />
              ) : (
                <>
                  <GhostButton
                    borderColor={theme.lightGray}
                    textColor={theme.veryLightText}
                    title={"Back to Distortions"}
                    style={{
                      marginRight: 24,
                      flex: 1,
                    }}
                    onPress={() => {
                      this.props.navigation.navigate(DISTORTION_SCREEN, {
                        thought: this.state.thought,
                      });
                    }}
                  />
                  <ActionButton title={"Next"} onPress={() => this.onNext()} />
                </>
              )}
            </Row>
          </>
        )}
      </Container>
    );
  }
}
