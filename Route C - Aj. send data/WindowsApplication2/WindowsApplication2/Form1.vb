Option Explicit On
Imports System.IO
Imports System.Net.Sockets

Public Class Form1
    Dim SR1 As String
    Dim SR2 As String
    Dim Listener As New TcpListener(8000)
    Dim Client As TcpClient
    Private Sub _FormClosing() Handles Me.FormClosing
        Listener.Stop()
    End Sub
    Private Sub Form1_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Timer1.Start()
        Listener.Start()
    End Sub
    Private Sub _Tick() Handles Timer1.Tick
        Dim Message As String
        Dim nStart As Integer
        Dim nLast As Integer

        If Listener.Pending = True Then
            Message = ""
            Client = Listener.AcceptTcpClient()
            Dim Reader As New StreamReader(Client.GetStream())

            While Reader.Peek > -1
                Message &= Convert.ToChar(Reader.Read()).ToString
            End While

            If Message.Contains("</>") Then
                nStart = InStr(Message, "</>") + 4
                nLast = InStr(Message, "<\>")
                Message = Mid(Message, nStart, nLast - nStart)
            End If
            TextBox1.Text = Message
            SR1 = TimeOfDay & vbCrLf & Message & vbCrLf & "------------------------------" & vbCrLf
            SR2 = SR1 & SR2
            TextBox3.Text = SR2
        End If

    End Sub

End Class
