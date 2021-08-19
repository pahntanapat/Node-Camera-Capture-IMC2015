
Option Explicit On
Imports System.IO
Imports System.Net.Sockets
Public Class Form1
    Dim Client As TcpClient
    Dim IPA = "10.70.37.97"
    Dim a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12 As String
    Dim b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12 As String
    Private Sub Button1_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button1.Click
        a1 = "ทีมที่1" & "  " & FS(RadioButton1.Checked, RadioButton2.Checked) & vbCrLf
        a2 = "ทีมที่2" & "  " & FS(RadioButton3.Checked, RadioButton4.Checked) & vbCrLf
        a3 = "ทีมที่3" & "  " & FS(RadioButton5.Checked, RadioButton6.Checked) & vbCrLf
        a4 = "ทีมที่4" & "  " & FS(RadioButton7.Checked, RadioButton8.Checked) & vbCrLf
        a5 = "ทีมที่5" & "  " & FS(RadioButton9.Checked, RadioButton10.Checked) & vbCrLf
        a6 = "ทีมที่6" & "  " & FS(RadioButton11.Checked, RadioButton12.Checked) & vbCrLf
        a7 = "ทีมที่7" & "  " & FS(RadioButton13.Checked, RadioButton14.Checked) & vbCrLf
        a8 = "ทีมที่8" & "  " & FS(RadioButton15.Checked, RadioButton16.Checked) & vbCrLf
        a9 = "ทีมที่9" & "  " & FS(RadioButton17.Checked, RadioButton18.Checked) & vbCrLf
        a10 = "ทีมที่10" & "  " & FS(RadioButton19.Checked, RadioButton20.Checked) & vbCrLf
        a11 = "ทีมที่11" & "  " & FS(RadioButton21.Checked, RadioButton22.Checked) & vbCrLf
        a12 = "ทีมที่12" & "  " & FS(RadioButton23.Checked, RadioButton24.Checked) & vbCrLf
        Try
            Client = New TcpClient(Label14.Text, 8000)
            Dim Writer As New StreamWriter(Client.GetStream())
            Writer.Write("</> " & a1 & a2 & a3 & a4 & a5 & a6 & a7 & a8 & a9 & a10 & a11 & a12 & " <\>")
            Writer.Flush()

        Catch ex As Exception
            MsgBox(ex.Message)
        End Try
        b1 = FS(RadioButton1.Checked, RadioButton2.Checked)
        b2 = FS(RadioButton3.Checked, RadioButton4.Checked)
        b3 = FS(RadioButton5.Checked, RadioButton6.Checked)
        b4 = FS(RadioButton7.Checked, RadioButton8.Checked)
        b5 = FS(RadioButton9.Checked, RadioButton10.Checked)
        b6 = FS(RadioButton11.Checked, RadioButton12.Checked)
        b7 = FS(RadioButton13.Checked, RadioButton14.Checked)
        b8 = FS(RadioButton15.Checked, RadioButton16.Checked)
        b9 = FS(RadioButton17.Checked, RadioButton18.Checked)
        b10 = FS(RadioButton19.Checked, RadioButton20.Checked)
        b11 = FS(RadioButton21.Checked, RadioButton22.Checked)
        b12 = FS(RadioButton23.Checked, RadioButton24.Checked)
        Cl()

    End Sub
    Function FS(ByVal SO1 As System.Object, ByVal SO2 As System.Object)
        Dim T As String
        T = ""
        If SO1 = True Then
            T = "ถูก"
        ElseIf SO2 = True Then
            T = "ผิด"
        Else
            T = "0"
        End If
        Return T
    End Function
    Sub KK(ByRef R1 As System.Object, ByRef R2 As System.Object, ByVal RX As String)
        If RX = "ถูก" Then
            R1 = True
        ElseIf RX = "ผิด" Then
            R2 = True
        ElseIf RX = "0" Then
            R1 = False
            R2 = False
        End If
    End Sub
    Private Sub CheckBox1_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox1.CheckedChanged
        If CheckBox1.Checked = True Then
            FlowLayoutPanel1.Enabled = False
        Else
            FlowLayoutPanel1.Enabled = True
        End If
    End Sub
    Private Sub CheckBox2_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox2.CheckedChanged
        If CheckBox2.Checked = True Then
            FlowLayoutPanel2.Enabled = False
        Else
            FlowLayoutPanel2.Enabled = True
        End If
    End Sub
    Private Sub CheckBox3_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox3.CheckedChanged
        If CheckBox3.Checked = True Then
            FlowLayoutPanel3.Enabled = False
        Else
            FlowLayoutPanel3.Enabled = True
        End If
    End Sub
    Private Sub CheckBox4_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox4.CheckedChanged
        If CheckBox4.Checked = True Then
            FlowLayoutPanel4.Enabled = False
        Else
            FlowLayoutPanel4.Enabled = True
        End If
    End Sub
    Private Sub CheckBox5_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox5.CheckedChanged
        If CheckBox5.Checked = True Then
            FlowLayoutPanel5.Enabled = False
        Else
            FlowLayoutPanel5.Enabled = True
        End If
    End Sub
    Private Sub CheckBox6_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox6.CheckedChanged
        If CheckBox6.Checked = True Then
            FlowLayoutPanel6.Enabled = False
        Else
            FlowLayoutPanel6.Enabled = True
        End If
    End Sub
    Private Sub CheckBox7_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox7.CheckedChanged
        If CheckBox7.Checked = True Then
            FlowLayoutPanel7.Enabled = False
        Else
            FlowLayoutPanel7.Enabled = True
        End If
    End Sub
    Private Sub CheckBox8_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox8.CheckedChanged
        If CheckBox8.Checked = True Then
            FlowLayoutPanel8.Enabled = False
        Else
            FlowLayoutPanel8.Enabled = True
        End If
    End Sub
    Private Sub CheckBox9_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox9.CheckedChanged
        If CheckBox9.Checked = True Then
            FlowLayoutPanel9.Enabled = False
        Else
            FlowLayoutPanel9.Enabled = True
        End If
    End Sub
    Private Sub CheckBox10_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox10.CheckedChanged
        If CheckBox10.Checked = True Then
            FlowLayoutPanel10.Enabled = False
        Else
            FlowLayoutPanel10.Enabled = True
        End If
    End Sub
    Private Sub CheckBox11_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox11.CheckedChanged
        If CheckBox11.Checked = True Then
            FlowLayoutPanel11.Enabled = False
        Else
            FlowLayoutPanel11.Enabled = True
        End If
    End Sub
    Private Sub CheckBox12_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CheckBox12.CheckedChanged
        If CheckBox12.Checked = True Then
            FlowLayoutPanel12.Enabled = False
        Else
            FlowLayoutPanel12.Enabled = True
        End If
    End Sub
    Sub Cl()
        RadioButton1.Checked = False
        RadioButton2.Checked = False
        RadioButton3.Checked = False
        RadioButton4.Checked = False
        RadioButton5.Checked = False
        RadioButton6.Checked = False
        RadioButton7.Checked = False
        RadioButton8.Checked = False
        RadioButton9.Checked = False
        RadioButton10.Checked = False
        RadioButton11.Checked = False
        RadioButton12.Checked = False
        RadioButton13.Checked = False
        RadioButton14.Checked = False
        RadioButton15.Checked = False
        RadioButton16.Checked = False
        RadioButton17.Checked = False
        RadioButton18.Checked = False
        RadioButton19.Checked = False
        RadioButton20.Checked = False
        RadioButton21.Checked = False
        RadioButton22.Checked = False
        RadioButton23.Checked = False
        RadioButton24.Checked = False
    End Sub
    Private Sub Button2_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button2.Click
        Cl()
    End Sub

    Private Sub Button3_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button3.Click
        KK(RadioButton1.Checked, RadioButton2.Checked, b1)
        KK(RadioButton3.Checked, RadioButton4.Checked, b2)
        KK(RadioButton5.Checked, RadioButton6.Checked, b3)
        KK(RadioButton7.Checked, RadioButton8.Checked, b4)
        KK(RadioButton9.Checked, RadioButton10.Checked, b5)
        KK(RadioButton11.Checked, RadioButton12.Checked, b6)
        KK(RadioButton13.Checked, RadioButton14.Checked, b7)
        KK(RadioButton15.Checked, RadioButton16.Checked, b8)
        KK(RadioButton17.Checked, RadioButton18.Checked, b9)
        KK(RadioButton19.Checked, RadioButton20.Checked, b10)
        KK(RadioButton21.Checked, RadioButton22.Checked, b11)
        KK(RadioButton23.Checked, RadioButton24.Checked, b12)
    End Sub

    Private Sub ตงคาการสงToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles ตงคาการสงToolStripMenuItem.Click
        Form2.Show()
    End Sub


    Private Sub Form1_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Label14.Text = IPA
    End Sub
End Class
