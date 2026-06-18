"use client";
import AttachmentAPI from "@/app/data/api/AttachmentAPI";
import { getLabel, locale } from "@/app/data/locale";
import { Helpers } from "@/app/utils";
import {
  CircularProgress,
  Stack,
  Typography,
  IconButton as MuiIconButton,
} from "@mui/material";
import React from "react";
import { useDropzone } from "react-dropzone";
import Chip from "@/elements/chip/Chip";
import IconButton from "@/elements/icon/IconButton";
import IconCustom from "@/elements/icon/IconCustom";
import ImageHandler from "@/elements/image/ImageHandler";
import Tooltip from "@/elements/tooltip/Tooltip";
import _ from "lodash";

export default function Basic(props) {
  const mainClassName = "module-upload-file";

  const {
    handleGetFile,
    label,
    error,
    helperText,
    id,
    multiple,
    directUpload,
    stillLoading,
    value, //  only for existing data
    accept,
  } = props;

  const [urls, setUrls] = React.useState({});

  const [refactorAcceptedFiles, setRefactorAcceptedFiles] = React.useState();

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    // Note how this callback is never invoked if drop occurs on the inner dropzone
    onDropAccepted: (files) => {},
    multiple: multiple,
    // accept: {
    //   'image/png': ['.png'],
    //   'text/html': ['.html', '.htm'],
    // }
    accept: accept?.svg && {
      "image/svg": [".svg"],
    },
  });

  const handleDeleteFile = (fileId) => {
    try {
      let newFiles = [...(refactorAcceptedFiles || [])];
      let newUrls = { ...(urls || {}) };

      newFiles = newFiles.filter((item) => item.id != fileId);

      newUrls = Helpers.filterObjectByKey(newUrls, fileId);

      setUrls(newUrls);
      setRefactorAcceptedFiles(newFiles);
    } catch (err) {}
  };

  const postFile = async (files) => {
    try {
      if (stillLoading) {
        await stillLoading(true);
      }

      async function upload(i) {
        const file = files[i].file;

        const arrPath = file?.path?.split(".");

        const body = {
          name: file?.name,
          file: file,
          path: directUpload?.path,
          extension: arrPath.at(-1),
        };

        const response = await AttachmentAPI.postAttachment({}, body);

        let result;

        if (response?.success) {
          result = {
            id: files[i]?.id,
            name: file?.name,
            path: file?.path,
            success: true,
            url: response?.payload?.result,
          };
        } else {
          result = {
            id: files[i]?.id,
            name: file?.name,
            path: file?.path,
            error: true,
            errorMessage:
              response.message || getLabel({ name: "errorOccured" }),
          };
        }

        urls[files[i]?.id] = result;
        setUrls({ ...(urls || {}) });

        if (i + 1 == files.length) {
          if (stillLoading) {
            await stillLoading(false);
          }
        }

        return result;
      }

      await Helpers.delayFunction({
        func: upload,
        length: files?.length,
        delay: 100,
      });
    } catch (err) {}
  };

  React.useEffect(() => {
    let newFiles = [...(refactorAcceptedFiles || [])];

    let newAcceptedFiles = acceptedFiles?.map((item) => {
      return {
        file: item,
        id: _.uniqueId(),
      };
    });

    newFiles = _.uniqBy(
      [...(newFiles || []), ...(newAcceptedFiles || [])],
      "id",
    );

    setRefactorAcceptedFiles(newFiles);

    if (directUpload) {
      (async () => {
        // === Adding Accepted Files ===

        const filesToUpload = newFiles.filter((item) => !urls[item.id]);

        await postFile(filesToUpload);
      })();
    }

    if (!directUpload && !multiple) {
      setRefactorAcceptedFiles(newFiles?.length > 0 && newFiles.slice(-1));
    }
  }, [acceptedFiles]);

  React.useEffect(() => {
    if (handleGetFile && !directUpload) {
      handleGetFile(refactorAcceptedFiles);
    }
  }, [refactorAcceptedFiles]);

  React.useEffect(() => {
    if (handleGetFile && directUpload) {
      handleGetFile(_.pickBy(urls, (value, key) => value.url));
    }
  }, [urls, directUpload, handleGetFile]);

  React.useEffect(() => {
    if (value?.length > 0 && !(refactorAcceptedFiles?.length > 0)) {
      let newUrls = {};

      const newFiles = value.map((item) => {
        const fileId = _.uniqueId();

        newUrls[fileId] = {
          name: item.name,
          url: item.url,
        };

        return {
          id: fileId,
          file: {
            path: item.name,
          },
        };
      });

      setUrls(newUrls);

      setRefactorAcceptedFiles(newFiles);
    }
  }, [value, refactorAcceptedFiles]);

  return (
    <Stack
      className={
        mainClassName + " " + (error || "") + " " + (multiple ? "multiple" : "")
      }
      id={id}
    >
      {label && (
        <Typography variant="body-2" component="label">
          {locale(label)}
        </Typography>
      )}
      <Stack spacing={2}>
        <div {...getRootProps({ className: "dropzone" })}>
          <div className={mainClassName + "-dropzone"}>
            <input {...getInputProps()} />
            <p className={mainClassName + "-info"}>
              {getLabel({ name: "dragNDrop" })}
            </p>
          </div>
        </div>

        {refactorAcceptedFiles?.length > 0 &&
          refactorAcceptedFiles?.map((objectFile, fileIndex) => {
            const file = objectFile?.file;

            const fileUrlData = urls && urls[objectFile?.id];
            // const url = window?.URL?.createObjectURL(new Blob([file]));
            return (
              <Stack
                key={mainClassName + "-accepted-file-" + fileIndex}
                direction={"row"}
                spacing={1}
              >
                <Tooltip title={fileUrlData?.errorMessage}>
                  {/* <ImageHandler
                    className={'size-small'}
                    src={url}
                  /> */}
                  <Chip
                    className={mainClassName + "-wrap-files"}
                    onClick={
                      fileUrlData?.url &&
                      (() => {
                        window.open(fileUrlData?.url);
                      })
                    }
                    onDelete={
                      multiple && (() => handleDeleteFile(objectFile?.id))
                    }
                    label={
                      <>
                        {(!multiple ? "File: " : "") +
                          " " +
                          ((file.path || file?.name) +
                            (file.size
                              ? " - " + Helpers.formatBytes(file.size)
                              : ""))}
                      </>
                    }
                    sx={{
                      width: "100%",
                      // borderColor: '#bbdefb',
                      // color: '#bbdefb',
                    }}
                    variant="outlined"
                    color={
                      directUpload && fileUrlData?.error ? "error" : "success"
                    }
                  />
                </Tooltip>
                {directUpload && (
                  <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    {fileUrlData ? (
                      fileUrlData?.success && (
                        <IconCustom icon="CheckCircle" color="green" />
                      )
                    ) : (
                      <CircularProgress
                        sx={{
                          width: "1rem !important",
                          height: "1rem !important",
                          color: "grey",
                        }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            );
          })}
      </Stack>

      {helperText && (
        <Typography
          variant="caption"
          component="label"
          sx={{ color: error ? "red" : "" }}
        >
          {locale(helperText)}
        </Typography>
      )}
    </Stack>
  );
}
