import { useRef, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  uploadAndPredictBulk,
  saveBulkPredictions,
  savePredictionHistory,
} from "../../api/AdminPredictAPI";
import { verifyAdminPassword } from "../../api/AdminActionAPI";

import ConfirmModal from "../../components/common/ConfirmModal";
import ConfirmAction from "../../components/auth/ConfirmAction";

import AdminPredictBanner from "../../components/admin-predict/AdminPredictBanner";
import AdminPredictUploadCard from "../../components/admin-predict/AdminPredictUploadCard";
import AdminPredictToolsCard from "../../components/admin-predict/AdminPredictToolsCard";
import AdminPredictResultModal from "../../components/admin-predict/AdminPredictResultModal";
import AdminPredictHistoryModal from "../../components/admin-predict/AdminPredictHistoryModal";

export default function Predict() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [showResultModal, setShowResultModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const openModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
  };

  const handlePredict = async () => {
    if (!file) {
      openModal("Please upload a file first.");
      return;
    }

    try {
      setLoading(true);

      const response = await uploadAndPredictBulk(file);

      const finalResult = {
        fileName: file.name,
        totalRows: response.total_rows || 0,
        predictedRows: response.predicted_rows || 0,
        failedRows: response.failed_rows || 0,
        rows: response.results || [],
        errors: response.errors || [],
        modelInfo: response.model_info || {},
      };

      setResult(finalResult);

      setHistory((prev) => [
        {
          fileName: file.name,
          totalRows: finalResult.totalRows,
          predictedRows: finalResult.predictedRows,
          failedRows: finalResult.failedRows,
          createdAt: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      setShowResultModal(true);
    } catch (error) {
      openModal(error.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    setFile(null);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const executeSave = async () => {
    try {
      setSaving(true);

      const saveResponse = await saveBulkPredictions(result.rows);

      const historyResponse = await savePredictionHistory({
        file_name: result.fileName,
        total_rows: result.totalRows,
        predicted_rows: result.predictedRows,
        failed_rows: result.failedRows,
        model_info: result.modelInfo || {},
        results: result.rows,
      });

      setConfirmSaveOpen(false);

      openModal(
        `Saved successfully!\nRows: ${saveResponse.saved_rows}\nHistory ID: ${historyResponse.history_id}`
      );
    } catch (error) {
      openModal(error.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!result || !result.rows?.length) {
      openModal("Please predict first before saving.");
      return;
    }

    setConfirmSaveOpen(true);
  };

  const handleConfirmSave = async (password) => {
    try {
      await verifyAdminPassword(password);
      await executeSave();
    } catch (error) {
      throw new Error(error.message || "Wrong password. Try again.");
    }
  };

  return (
    <AdminLayout>
      <ConfirmModal
        isOpen={modalOpen}
        message={modalMessage}
        onConfirm={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        confirmText="OK"
        cancelText=""
      />

      <ConfirmAction
        isOpen={confirmSaveOpen}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
        message={
          "Are you sure you want to save this data to the database?\n\nThis action cannot be undone."
        }
        loading={saving}
      />

      <div className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <AdminPredictBanner />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.9fr_0.9fr]">
            <AdminPredictUploadCard
              fileInputRef={fileInputRef}
              file={file}
              loading={loading}
              saving={saving}
              result={result}
              onUploadClick={handleUploadClick}
              onFileChange={handleFileChange}
              onPredict={handlePredict}
              onUndo={handleUndo}
              onSave={handleSave}
            />

            <AdminPredictToolsCard
              onShowResult={() => setShowResultModal(true)}
              onShowHistory={() => setShowHistoryModal(true)}
            />
          </div>
        </div>

        <AdminPredictResultModal
          open={showResultModal}
          result={result}
          onClose={() => setShowResultModal(false)}
        />

        <AdminPredictHistoryModal
          open={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      </div>
    </AdminLayout>
  );
}